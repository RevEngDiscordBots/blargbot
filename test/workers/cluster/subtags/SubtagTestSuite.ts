import { Cluster } from '@cluster';
import { BBTagContext, BBTagEngine, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { BaseRuntimeLimit } from '@cluster/bbtag/limits/BaseRuntimeLimit';
import { BBTagContextOptions, BBTagRuntimeScope, LocatedRuntimeError, SourceMarker, SubtagCall } from '@cluster/types';
import { bbtagUtil, guard, pluralise as p, SubtagType } from '@cluster/utils';
import { Database } from '@core/database';
import { Logger } from '@core/Logger';
import { ModuleLoader } from '@core/modules';
import { SubtagVariableType, TagVariablesTable } from '@core/types';
import { expect } from 'chai';
import { APIChannel, APIGuild, APIGuildMember, APIMessage, APIUser, ChannelType, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildMFALevel, GuildNSFWLevel, GuildPremiumTier, GuildVerificationLevel } from 'discord-api-types';
import { BaseData, Client as Discord, Collection, Constants, Guild, KnownGuildTextableChannel, Message, Shard, ShardManager, User } from 'eris';
import * as fs from 'fs';
import * as inspector from 'inspector';
import { Context, describe, it } from 'mocha';
import path from 'path';
import { anyOfClass, anyString, instance, mock, setStrict, when } from 'ts-mockito';
import { MethodStubSetter } from 'ts-mockito/lib/MethodStubSetter';
import { inspect } from 'util';

type SourceMarkerResolvable = SourceMarker | number | `${number}:${number}:${number}` | `${number}:${number}` | `${number}`;

export interface SubtagTestCase {
    readonly code: string;
    readonly subtagName?: string;
    readonly expected?: string | RegExp | (() => string | RegExp);
    readonly setup?: (context: SubtagTestContext) => Awaitable<void>;
    readonly assert?: (context: BBTagContext, result: string, test: SubtagTestContext) => Awaitable<void>;
    readonly teardown?: (context: SubtagTestContext) => Awaitable<void>;
    readonly errors?: ReadonlyArray<{ start?: SourceMarkerResolvable; end?: SourceMarkerResolvable; error: BBTagRuntimeError; }> | ((errors: LocatedRuntimeError[]) => void);
    readonly subtags?: readonly Subtag[];
    readonly skip?: boolean | (() => Awaitable<boolean>);
    readonly retries?: number;
}

type TestSuiteConfig = { [P in keyof Pick<SubtagTestCase, 'setup' | 'assert' | 'teardown'>]-?: Array<Required<SubtagTestCase>[P]> };

export class MarkerError extends BBTagRuntimeError {
    public constructor(type: string, index: number) {
        super(`{${type}} called at ${index}`);
        this.display = '';
    }
}

export interface SubtagTestSuiteData<T extends Subtag = Subtag> extends Pick<SubtagTestCase, 'setup' | 'assert' | 'teardown'> {
    readonly cases: SubtagTestCase[];
    readonly subtag: T;
    readonly runOtherTests?: (subtag: T) => void;
}

export class Mock<T> {
    #mock: T;

    // eslint-disable-next-line @typescript-eslint/ban-types
    public constructor(clazz?: (new (...args: never[]) => T) | (Function & { prototype: T; }), strict = true) {
        this.#mock = mock(clazz);
        if (!strict)
            setStrict(this.#mock, false);
    }

    public setup<R>(action: (instance: T) => Promise<R>): MethodStubSetter<Promise<R>, R, Error>
    public setup<R>(action: (instance: T) => R): MethodStubSetter<R>
    public setup(action: (instance: T) => unknown): MethodStubSetter<unknown, unknown, unknown> {
        return when(action(this.#mock));
    }

    public get instance(): T {
        return instance(this.#mock);
    }
}

/* eslint-disable @typescript-eslint/naming-convention */
export class SubtagTestContext {
    public readonly cluster: Mock<Cluster>;
    public readonly shard: Mock<Shard>;
    public readonly shards: Mock<ShardManager>;
    public readonly discord: Mock<Discord>;
    public readonly logger: Mock<Logger>;
    public readonly database: Mock<Database>;
    public readonly tagVariablesTable: Mock<TagVariablesTable>;

    public readonly tagVariables: Record<`${SubtagVariableType}.${string}.${string}`, JToken | undefined>;
    public readonly rootScope: BBTagRuntimeScope = { functions: {}, inLock: false };

    public readonly options: Mutable<Partial<BBTagContextOptions>>;
    public readonly message: APIMessage = { ...SubtagTestContext.#messageDefaults() };
    public readonly guild: APIGuild = { ...SubtagTestContext.#guildDefaults() };

    public constructor(subtags: Iterable<Subtag>) {
        this.logger = new Mock<Logger>(undefined, false);
        this.discord = new Mock(Discord);
        this.cluster = new Mock(Cluster);
        this.shard = new Mock(Shard);
        this.shards = new Mock(ShardManager);
        this.database = new Mock(Database);
        this.tagVariablesTable = new Mock<TagVariablesTable>();
        this.tagVariables = {};
        this.options = {};

        this.logger.setup(m => m.error).thenReturn((...args: unknown[]) => {
            throw new Error('Unexpected logger error: ' + inspect(args));
        });

        this.cluster.setup(m => m.discord).thenReturn(this.discord.instance);
        this.cluster.setup(m => m.database).thenReturn(this.database.instance);
        this.cluster.setup(m => m.logger).thenReturn(this.logger.instance);

        this.database.setup(m => m.tagVariables).thenReturn(this.tagVariablesTable.instance);
        this.tagVariablesTable.setup(m => m.get(anyString(), anyString(), anyString()))
            .thenCall((name: string, type: SubtagVariableType, scope: string) => this.tagVariables[`${type}.${scope}.${name}`]);

        this.discord.setup(m => m.shards).thenReturn(this.shards.instance);
        this.discord.setup(m => m.guildShardMap).thenReturn({});
        this.discord.setup(m => m.channelGuildMap).thenReturn({});
        this.discord.setup(m => m.options).thenReturn({ intents: [] });

        this.shards.setup(m => m.get(0)).thenReturn(this.shard.instance);
        this.shard.setup(m => m.client).thenReturn(this.discord.instance);

        this.discord.setup(m => m.guilds).thenReturn(new Collection(Guild));
        this.discord.setup(m => m.users).thenReturn(new Collection(User));

        const subtagLoader = new Mock<ModuleLoader<Subtag>>(ModuleLoader);
        const subtagMap = new Map([...subtags].flatMap(s => [s.name, ...s.aliases].map(n => [n, s])));
        subtagLoader.setup(m => m.get(anyString())).thenCall((name: string) => subtagMap.get(name));

        this.cluster.setup(c => c.subtags).thenReturn(subtagLoader.instance);
    }

    public createContext(): BBTagContext {
        const engine = new BBTagEngine(this.cluster.instance);

        const guild = new Guild(<BaseData><unknown><APIGuild>{
            ...this.guild
        }, this.discord.instance);
        this.discord.instance.guilds.add(guild);

        for (const channel of guild.channels.values())
            this.discord.setup(m => m.getChannel(channel.id)).thenReturn(channel);

        const channel = guild.channels.find(guard.isTextableChannel);
        if (channel === undefined)
            throw new Error('No text channels were added');

        const sender = [...guild.members.values()][0];

        const message = new Message<KnownGuildTextableChannel>(<BaseData><unknown><APIMessage>{
            ...this.message,
            channel_id: channel.id,
            guild_id: guild.id,
            author: sender.user
        }, this.discord.instance);

        const limit = new Mock(BaseRuntimeLimit);
        limit.setup(m => m.check(anyOfClass(BBTagContext), anyString())).thenResolve();

        const context = new BBTagContext(engine, {
            author: sender.id,
            inputRaw: '',
            isCC: false,
            limit: limit.instance,
            message: message,
            ...this.options
        });

        Object.assign(context.scopes.root, this.rootScope);

        return context;
    }
    static #messageDefaults(): APIMessage {
        return {
            id: '0',
            channel_id: '0',
            guild_id: '0',
            author: this.#userDefaults(),
            member: this.#memberDefaults(),
            attachments: [],
            content: '',
            edited_timestamp: '1970-01-01T00:00:00Z',
            embeds: [],
            mention_everyone: false,
            mention_roles: [],
            mentions: [],
            pinned: false,
            timestamp: '1970-01-01T00:00:00Z',
            tts: false,
            type: Constants.MessageTypes.DEFAULT
        };
    }
    static #userDefaults(): APIUser {
        return {
            avatar: null,
            discriminator: '0000',
            id: '0',
            username: 'Test User'
        };
    }
    static #memberDefaults(): APIGuildMember {
        return {
            deaf: false,
            joined_at: '1970-01-01T00:00:00Z',
            mute: false,
            roles: [],
            user: this.#userDefaults()
        };
    }
    static #guildDefaults(): APIGuild {
        return {
            id: '0',
            afk_channel_id: null,
            afk_timeout: 0,
            application_id: null,
            banner: null,
            default_message_notifications: GuildDefaultMessageNotifications.AllMessages,
            description: null,
            discovery_splash: null,
            emojis: [],
            explicit_content_filter: GuildExplicitContentFilter.Disabled,
            features: [],
            icon: null,
            mfa_level: GuildMFALevel.None,
            name: 'Test Guild',
            nsfw_level: GuildNSFWLevel.Default,
            owner_id: '0',
            preferred_locale: 'en-US',
            premium_progress_bar_enabled: false,
            premium_tier: GuildPremiumTier.None,
            roles: [],
            public_updates_channel_id: null,
            rules_channel_id: null,
            splash: null,
            stickers: [],
            system_channel_flags: 0,
            system_channel_id: null,
            vanity_url_code: null,
            verification_level: GuildVerificationLevel.None,
            region: '',
            channels: [
                this.#channelDefaults()
            ],
            members: [
                this.#memberDefaults()
            ]
        };
    }
    static #channelDefaults(): APIChannel {
        return {
            id: '0',
            guild_id: '0',
            name: 'Test Channel',
            type: ChannelType.GuildText,
            position: 0,
            permission_overwrites: [],
            nsfw: false,
            topic: 'Test channel!'
        };
    }
}
/* eslint-enable @typescript-eslint/naming-convention */

export function runSubtagTests<T extends Subtag>(data: SubtagTestSuiteData<T>): void {
    const suite = new SubtagTestSuite(data.subtag);
    if (data.setup !== undefined)
        suite.setup(data.setup);
    if (data.assert !== undefined)
        suite.assert(data.assert);
    if (data.teardown !== undefined)
        suite.teardown(data.teardown);
    for (const testCase of data.cases)
        suite.addTestCase(testCase);
    suite.run(() => data.runOtherTests?.(data.subtag));

    // Output a bbtag file that can be run on the live blargbot instance to find any errors
    if (inspector.url() !== undefined) {
        const blargTestSuite = `Errors:{clean;${data.cases.map(c => ({
            code: c.code,
            expected: getExpectation(c)
        })).map(c => `{if;==;|${c.code}|;|${c.expected?.toString() ?? ''}|;;
> {escapebbtag;${c.code}} failed -
Expected:
|${c.expected?.toString() ?? ''}|
Actual:
|${c.code}|}`).join('\n')}}
---------------
Finished!`;
        const root = require.resolve('@config');
        fs.writeFileSync(path.dirname(root) + '/test.bbtag', blargTestSuite);
    }
}

export function sourceMarker(location: SourceMarkerResolvable): SourceMarker
export function sourceMarker(location: SourceMarkerResolvable | undefined): SourceMarker | undefined
export function sourceMarker(location: SourceMarkerResolvable | undefined): SourceMarker | undefined {
    if (typeof location === 'number')
        return { index: location, line: 0, column: location };
    if (typeof location === 'object')
        return location;
    if (typeof location === 'undefined')
        return undefined;

    const segments = location.split(':');
    const index = segments[0];
    const line = segments[1] ?? '0';
    const column = segments[2] ?? index;

    return { index: parseInt(index), line: parseInt(line), column: parseInt(column) };
}

export class EvalSubtag extends Subtag {
    public constructor() {
        super({
            name: 'eval',
            category: SubtagType.SIMPLE,
            hidden: true,
            signatures: []
        });
    }

    protected executeCore(_context: BBTagContext, _subtagName: string, subtag: SubtagCall): never {
        throw new MarkerError('eval', subtag.start.index);
    }
}

export class FailTestSubtag extends Subtag {
    public constructor() {
        super({
            name: 'fail',
            category: SubtagType.SIMPLE,
            signatures: [],
            hidden: true
        });
    }

    public executeCore(_context: BBTagContext, _subtagName: string, subtag: SubtagCall): never {
        throw new RangeError(`Subtag ${subtag.source} was evaluated when it wasnt supposed to!`);
    }
}

export class LimitedTestSubtag extends Subtag {
    readonly #counts = new WeakMap<BBTagContext, number>();
    readonly #limit: number;

    public constructor(limit = 1) {
        super({
            name: 'limit',
            category: SubtagType.SIMPLE,
            signatures: []
        });
        this.#limit = limit;
    }

    protected executeCore(context: BBTagContext): never {
        const count = this.#counts.get(context) ?? 0;
        this.#counts.set(context, count + 1);

        if (count >= this.#limit)
            throw new Error(`Subtag {limit} cannot be called more than ${this.#limit} time(s)`);
        throw new MarkerError('limit', count + 1);
    }
}

export class SubtagTestSuite {
    readonly #config: TestSuiteConfig = { setup: [], assert: [], teardown: [] };
    readonly #testCases: SubtagTestCase[] = [];
    readonly #subtag: Subtag;

    public constructor(subtag: Subtag) {
        this.#subtag = subtag;
    }

    public setup(setup: Required<SubtagTestCase>['setup']): this {
        this.#config.setup.push(setup);
        return this;
    }

    public assert(assert: Required<SubtagTestCase>['assert']): this {
        this.#config.assert.push(assert);
        return this;

    }

    public teardown(teardown: Required<SubtagTestCase>['teardown']): this {
        this.#config.teardown.push(teardown);
        return this;

    }

    public addTestCase(testCase: SubtagTestCase): this {
        this.#testCases.push(testCase);
        return this;
    }

    public run(otherTests?: () => void): void {
        describe(`{${this.#subtag.name}}`, () => {
            const subtag = this.#subtag;
            const config = this.#config;
            for (const testCase of this.#testCases) {
                it(getTestName(testCase), function () {
                    return runTestCase(this, subtag, testCase, config);
                }).retries(testCase.retries ?? 0);
            }

            otherTests?.();
        });
    }
}

function getTestName(testCase: SubtagTestCase): string {
    let result = `should handle ${JSON.stringify(testCase.code)}`;
    const expected = getExpectation(testCase);
    switch (typeof expected) {
        case 'undefined': break;
        case 'string':
            result += ` and return ${JSON.stringify(expected)}`;
            break;
        case 'object':
            result += ` and return ${expected.toString()}`;
            break;
    }

    if (typeof testCase.errors === 'object') {
        const [errorCount, markerCount] = testCase.errors.reduce((p, c) => c.error instanceof MarkerError ? [p[0], p[1] + 1] : [p[0] + 1, p[1]], [0, 0]);
        if (errorCount > 0 || markerCount > 0) {
            const errorStr = errorCount === 0 ? undefined : `${errorCount} ${p(errorCount, 'error')}`;
            const markerStr = markerCount === 0 ? undefined : `${markerCount} ${p(markerCount, 'marker')}`;
            result += ` with ${[markerStr, errorStr].filter(x => x !== undefined).join(' and ')}`;
        }
    }

    return result;
}

async function runTestCase(context: Context, subtag: Subtag, testCase: SubtagTestCase, config: TestSuiteConfig): Promise<void> {
    if (typeof testCase.skip === 'boolean' ? testCase.skip : await testCase.skip?.() ?? false)
        context.skip();

    const subtags = [subtag, new EvalSubtag(), new FailTestSubtag(), ...testCase.subtags ?? []];
    const test = new SubtagTestContext(subtags);
    try {
        // arrange
        for (const setup of config.setup)
            await setup(test);
        await testCase.setup?.(test);
        const code = bbtagUtil.parse(testCase.code);
        const context = test.createContext();
        const expected = getExpectation(testCase);

        // act
        const result = await context.eval(code);

        // assert
        switch (typeof expected) {
            case 'string':
                expect(result).to.equal(expected);
                break;
            case 'object':
                expect(result).to.match(expected);
                break;
        }

        await testCase.assert?.(context, result, test);
        for (const assert of config.assert)
            await assert(context, result, test);

        if (typeof testCase.errors === 'function') {
            testCase.errors(context.errors);
        } else {
            expect(context.errors.map(err => ({ error: err.error, start: err.subtag?.start, end: err.subtag?.end })))
                .excludingEvery('stack')
                .to.deep.equal(testCase.errors?.map(err => ({ error: err.error, start: sourceMarker(err.start), end: sourceMarker(err.end) })) ?? [],
                    'Error details didnt match the expectation');
        }

    } finally {
        for (const teardown of config.teardown)
            await teardown(test);
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function getExpectation(testCase: SubtagTestCase): Exclude<SubtagTestCase['expected'], Function> {
    if (typeof testCase.expected === 'function')
        return testCase.expected();
    return testCase.expected;
}
