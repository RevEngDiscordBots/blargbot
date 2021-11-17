import { BBTagMaybeRef, BBTagRef, CompositeSubtagHandler, Statement, SubtagCall, SubtagHandlerCallSignature, SubtagOptions, SubtagResult } from '@cluster/types';
import { SubtagType } from '@cluster/utils';
import { Logger } from '@core/Logger';
import { metrics } from '@core/Metrics';
import { Timer } from '@core/Timer';
import { Snowflake } from 'catflake';
import { EmojiIdentifierResolvable, Guild, GuildChannels, GuildEmoji, GuildMember, MessageEmbedOptions, Role, User } from 'discord.js';
import { Duration } from 'moment';

import { BBTagContext } from './BBTagContext';
import { compileSignatures, parseDefinitions } from './compilation';
import { BBTagRuntimeError } from './errors';

export abstract class Subtag implements SubtagOptions {
    public readonly name: string;
    public readonly aliases: readonly string[];
    public readonly category: SubtagType;
    public readonly desc: string | undefined;
    public readonly deprecated: string | boolean;
    public readonly staff: boolean;
    public readonly signatures: readonly SubtagHandlerCallSignature[];
    public readonly handler: CompositeSubtagHandler;
    public readonly hidden: boolean;

    protected constructor(options: SubtagOptions) {
        this.name = options.name;
        this.aliases = options.aliases ?? [];
        this.category = options.category;
        this.desc = options.desc;
        this.deprecated = options.deprecated ?? false;
        this.staff = options.staff ?? false;
        this.hidden = options.hidden ?? false;
        this.signatures = parseDefinitions(options.definition);
        this.handler = compileSignatures(this.signatures);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async * execute(context: BBTagContext, subtagName: string, subtag: SubtagCall): SubtagResult {
        const timer = new Timer().start();
        try {
            yield* this.handler.execute(context, subtagName, subtag);
        } finally {
            timer.end();
            metrics.subtagLatency.labels(this.name).observe(timer.elapsed);
            const debugPerf = context.state.subtags[this.name] ??= [];
            debugPerf.push(timer.elapsed);
        }
    }

    public enrichDocs: never;

    public static signature<Return extends SubtagReturnType, Parameters extends readonly SubtagParameterDescriptor[] | []>(returns: Return, parameters: Parameters, details: SubtagSignatureOptions): SubtagSignatureDecorator<Return, Parameters> {
        returns;
        parameters;
        details;
        throw new Error('NotImplemented');
    }

    public static argument<Name extends string, Type extends SubtagArgumentType>(name: Name, type: Type, options?: SubtagArgumentOptions<Type>): SubtagParameterDescriptor<SubtagArgumentTypeMap[Type], Name>;
    public static argument<Type extends SubtagArgumentType>(name: string, type: Type, options?: SubtagArgumentOptions<Type>): SubtagParameterDescriptor<unknown, string> {
        name;
        type;
        options;
        throw new Error('NotImplemented');
    }

    public static argumentGroup<Parameters extends ReadonlyArray<SubtagParameterDescriptor<unknown, string>>>(parameters: Parameters): SubtagParameterDescriptor<SubtagParameterGroupValue<Parameters>, undefined>;
    public static argumentGroup(parameters: ReadonlyArray<SubtagParameterDescriptor<unknown, string>>): SubtagParameterDescriptor<unknown[], undefined> {
        parameters;
        throw new Error('NotImplemented');
    }

    public static context(): SubtagParameterDescriptor<BBTagContext, undefined>;
    public static context<T>(getValue: (context: BBTagContext) => T): SubtagParameterDescriptor<T, undefined>;
    public static context(getValue?: (context: BBTagContext) => unknown): SubtagParameterDescriptor<unknown, undefined> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static guild(): SubtagParameterDescriptor<Guild, undefined>;
    public static guild<T>(getValue: (guild: Guild) => T): SubtagParameterDescriptor<T, undefined>;
    public static guild(getValue?: (guild: Guild) => unknown): SubtagParameterDescriptor<unknown, undefined> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static subtagAST(): SubtagParameterDescriptor<SubtagCall, undefined>;
    public static subtagAST<T>(getValue: (subtag: SubtagCall) => T): SubtagParameterDescriptor<T, undefined>;
    public static subtagAST(getValue?: (subtag: SubtagCall) => unknown): SubtagParameterDescriptor<unknown, undefined> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static subtagName(): SubtagParameterDescriptor<string, undefined>
    public static subtagName<T>(getValue: (name: string) => T): SubtagParameterDescriptor<T, undefined>
    public static subtagName(getValue?: (name: string) => unknown): SubtagParameterDescriptor<unknown, undefined> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static quietArgument(): SubtagParameterDescriptor<boolean, 'quiet'>;
    public static quietArgument<T extends string>(name: T): SubtagParameterDescriptor<boolean, T>;
    public static quietArgument(name = 'quiet'): SubtagParameterDescriptor<boolean, string> {
        name;
        throw new Error('NotImplemented');
    }

    public static useValue<T>(value: T): SubtagParameterDescriptor<T, undefined> {
        value;
        throw new Error('NotImplemented');
    }

    public static fallback<T extends SubtagArgumentType>(type: T, options?: SubtagArgumentOptions<T>): SubtagParameterDescriptor<SubtagArgumentTypeMap[T] | undefined, undefined> {
        type;
        options;
        throw new Error('NotImplemented');
    }

    public static logger(): SubtagParameterDescriptor<Logger, undefined> {
        throw new Error('NotImplemented');
    }
}

Subtag.argumentGroup([
    Subtag.quietArgument().noEmit()
]);

type CustomErrorFactory<T> = string | ((value: T, context: BBTagContext, rawValue: string, ast: Statement) => string | BBTagRuntimeError);

interface SubtagParameterDescriptor<TValue = unknown, TName extends string | undefined = undefined | string> {
    readonly name: TName;
    getValue(context: BBTagContext, subtag: SubtagCall, index: number): Awaitable<TValue>;

    noEmit(): SubtagParameterDescriptor<never, TName>;

    allowOmitted(): SubtagParameterDescriptor<TValue | undefined, TName>;
    ifOmittedUse<T extends Exclude<JValue, string>>(value: T): SubtagParameterDescriptor<TValue | T, TName>;
    ifOmittedUse(bbtag: string, isBBTag?: true): SubtagParameterDescriptor<TValue, TName>;
    ifOmittedUse<T extends string>(bbtag: T, isBBTag: false): SubtagParameterDescriptor<TValue | T, TName>;

    catch(): SubtagParameterDescriptor<TValue | undefined, TName>;
    catch<T>(handler: (error: BBTagRuntimeError, value: string, context: BBTagContext, ast: Statement) => T): SubtagParameterDescriptor<TValue | Exclude<T, BBTagRuntimeError>, TName>;
    catch<T extends Exclude<JValue, string>>(value: T): SubtagParameterDescriptor<TValue | T, TName>;
    catch(bbtag: string, isBBTag?: true): SubtagParameterDescriptor<TValue, TName>;
    catch<T extends string>(bbtag: T, isBBTag: false): SubtagParameterDescriptor<TValue | T, TName>;

    guard<T extends TValue>(guard: (value: TValue) => value is T, customError?: CustomErrorFactory<TValue>): SubtagParameterDescriptor<T, TName>;
    guard(guard: (value: TValue) => boolean, customError?: CustomErrorFactory<TValue>): SubtagParameterDescriptor<TValue, TName>;
    guard<T extends TValue & JValue>(options: Iterable<T>, customError?: CustomErrorFactory<TValue>): SubtagParameterDescriptor<T, TName>;

    convert<T>(converter: (value: TValue) => T, customError?: CustomErrorFactory<TValue>): SubtagParameterDescriptor<T, TName>;
    convert<T extends string & TValue>(convert: 'lowercase', customError?: CustomErrorFactory<TValue>): SubtagParameterDescriptor<Lowercase<T>, TName>;
    convert<T extends string & TValue>(convert: 'uppercase', customError?: CustomErrorFactory<TValue>): SubtagParameterDescriptor<Uppercase<T>, TName>;

    repeat(minCount: number, maxCount: number, flattenArrays?: 'flatten'): [TValue] extends [unknown[]] ? never : SubtagParameterDescriptor<TValue[], TName>;
}

interface SubtagArgumentOptionsCore<T> {
    readonly isVariableName?: boolean | 'maybe';
    readonly maxSourceLength?: number;
    readonly quietParseError?: string;
    readonly parseError?: CustomErrorFactory<T | undefined>;
    readonly useFallback?: boolean;
}

interface SubtagLookupArgumentOptions {
    readonly noErrors?: boolean;
    readonly noLookup?: boolean;
}

interface SubtagBooleanArgumentOptions {
    readonly mode?: 'parse' | 'notEmpty' | 'tryParseOrNotEmpty';
}

interface SubtagNumericArgumentOptions {
    readonly min?: number;
    readonly max?: number;
    readonly mod?: number;
    readonly rangeError?: CustomErrorFactory<number>;
}

interface SubtagEmbedArgumentOptions {
    readonly allowMalformed?: boolean;
}

interface SubtagArrayArgumentOptions {
    readonly flattenArray?: boolean;
}

type SubtagArgumentOptionsMap = {
    'user': SubtagLookupArgumentOptions;
    'member': SubtagLookupArgumentOptions;
    'channel': SubtagLookupArgumentOptions;
    'role': SubtagLookupArgumentOptions;
    'boolean': SubtagBooleanArgumentOptions;
    'integer': SubtagNumericArgumentOptions;
    'number': SubtagNumericArgumentOptions;
    'float': SubtagNumericArgumentOptions;
    'color': SubtagNumericArgumentOptions;
    'embed': SubtagEmbedArgumentOptions;
    '[]': SubtagArrayArgumentOptions;
}

type SubtagArgumentOptions<TypeKey extends SubtagArgumentType> =
    & SubtagArgumentOptionsCore<SubtagArgumentTypeMap[TypeKey]>
    & (TypeKey extends keyof SubtagArgumentOptionsMap ? SubtagArgumentOptionsMap[TypeKey] : unknown)
    & (TypeKey extends `${infer T}${'[]' | '*' | '~' | '[]*' | '[]~'}` ? T extends keyof SubtagArgumentOptionsMap ? SubtagArgumentOptionsMap[T] : unknown : unknown)
    & (TypeKey extends `${string}[]${'' | '*' | '~'}` ? SubtagArgumentOptionsMap['[]'] : unknown);

type Iterated<T> = Iterable<T> | AsyncIterable<T>;

type SubtagReturnTypeMapGenerator<TypeName extends string, Type> =
    & Record<TypeName, Type>
    & Record<`${TypeName}?`, Type | undefined>
    & Record<`${TypeName}[]`, Iterated<Type>>
    & Record<`${TypeName}[]?`, Iterated<Type> | undefined>
    & Record<`${TypeName}?[]`, Iterated<Type | undefined>>

type SubtagReturnTypeMap =
    & SubtagReturnTypeMapGenerator<'string', string>
    & SubtagReturnTypeMapGenerator<'boolean', boolean>
    & SubtagReturnTypeMapGenerator<'number' | 'integer' | 'float' | 'color', number>
    & SubtagReturnTypeMapGenerator<'snowflake', Snowflake>
    & SubtagReturnTypeMapGenerator<'json', JToken>
    & {
        'nothing': void;
        'error': never;
        'loop': Iterated<JToken>;
        '(string|error)[]': Iterated<JToken>;
        'number|boolean': number | boolean;
    }

type SubtagReturnType = keyof SubtagReturnTypeMap;

type SubtagRefableArgumentTypeMapCore = {
    'string': string;
    'integer': number;
    'number': number;
    'float': number;
    'color': number;
    'boolean': boolean;
    'json': JToken; // uses bbtagutil.json.parse
    'snowflake': string;
}

type SubtagArgumentTypeMapCore = SubtagRefableArgumentTypeMapCore & {
    'bigint': bigint;
    'duration': Duration;
    'user': User;
    'member': GuildMember;
    'channel': GuildChannels;
    'role': Role;
    'emoji': EmojiIdentifierResolvable;
    'guildEmoji': GuildEmoji;
    'embed': MessageEmbedOptions;
}
type SubtagArgumentTypeMap =
    & SubtagArgumentTypeMapCore
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}[]`]: Array<SubtagArgumentTypeMapCore[P]> }
    & { [P in keyof SubtagRefableArgumentTypeMapCore as `${P}*`]: BBTagRef<SubtagRefableArgumentTypeMapCore[P]> }
    & { [P in keyof SubtagRefableArgumentTypeMapCore as `${P}~`]: BBTagMaybeRef<SubtagRefableArgumentTypeMapCore[P]> }
    & { [P in keyof SubtagRefableArgumentTypeMapCore as `${P}[]*`]: BBTagRef<Array<SubtagRefableArgumentTypeMapCore[P]>> }
    & { [P in keyof SubtagRefableArgumentTypeMapCore as `${P}[]~`]: BBTagMaybeRef<Array<SubtagRefableArgumentTypeMapCore[P]>> }
    & {
        'deferred': () => Awaitable<string>;
        'ast': Statement;
        'json?': JToken | undefined;
        'source': string;
        'variable': BBTagRef<JToken | undefined>;
    }

type SubtagArgumentType = keyof SubtagArgumentTypeMap;

interface SubtagSignatureOptions {
    readonly mergeErrors?: (errors: BBTagRuntimeError[]) => BBTagRuntimeError;
    readonly description?: string;
    readonly exampleCode?: string;
    readonly exampleIn?: string;
    readonly exampleOut?: string;
    readonly hidden?: boolean;
}

type ParameterType<T> = T extends SubtagParameterDescriptor<infer R> ? R : never;
type ParameterTypes<Parameters extends readonly unknown[]> = ParameterTypesHelper<ExcludeItem<Parameters, SubtagParameterDescriptor<never>>, readonly []>;
type ParameterTypesHelper<Remaining extends readonly unknown[], Result extends readonly unknown[]> =
    Remaining extends readonly [infer I, ...infer Rest]
    ? ParameterTypesHelper<Rest, readonly [...Result, ParameterType<I>]>
    : Result;

type SubtagSignatureDecorator<Return extends SubtagReturnType, Parameters extends ReadonlyArray<SubtagParameterDescriptor<unknown>>>
    = ConstrainedMethodDecorator<Subtag, ParameterTypes<Parameters>, Awaitable<SubtagReturnTypeMap[Return]>>

type SubtagParameterGroupValue<Parameters extends ReadonlyArray<SubtagParameterDescriptor<unknown, string>>> = {
    [P in Parameters[number]as P['name']]: ReturnType<P['getValue']>
}
