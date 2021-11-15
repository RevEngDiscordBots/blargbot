import { BBTagMaybeRef, BBTagRef, CompositeSubtagHandler, Statement, SubtagCall, SubtagHandlerCallSignature, SubtagOptions, SubtagResult } from '@cluster/types';
import { SubtagType } from '@cluster/utils';
import { Logger } from '@core/Logger';
import { metrics } from '@core/Metrics';
import { Timer } from '@core/Timer';
import { Snowflake } from 'catflake';
import { Emoji, Guild, GuildChannels, GuildEmoji, GuildMember, MessageEmbedOptions, Role, User } from 'discord.js';
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

    public enrichDocs(docs: MessageEmbedOptions): MessageEmbedOptions {
        return docs;
    }

    public static signature<Return extends SubtagReturnType, Parameters extends readonly SubtagParameterDescriptor[] | []>(returns: Return, parameters: Parameters, details?: SubtagSignatureOptions): SubtagSignatureDecorator<Return, Parameters> {
        returns;
        parameters;
        details;
        throw new Error('NotImplemented');
    }

    public static argument<Name extends string, Type extends SubtagArgumentType>(name: Name, type: Type, options?: SubtagParameterOptions<SubtagArgumentTypeMap[Type]>): NamedSubtagParameterDescriptor<Name, SubtagArgumentTypeMap[Type]>;
    public static argument<Name extends string, Type extends SubtagArgumentType, Default>(name: Name, type: Type, options?: SubtagFallbackParameterOptions<SubtagArgumentTypeMap[Type] | Default>): NamedSubtagParameterDescriptor<Name, SubtagArgumentTypeMap[Type] | Default>;
    public static argument<Name extends string, Type extends SubtagArgumentType>(name: Name, type: Type, options: RepeatedSubtagParameterOptions<Array<SubtagArgumentTypeMap[Type]>>): NamedSubtagParameterDescriptor<Name, Array<SubtagArgumentTypeMap[Type]>>;
    public static argument<Name extends string, Type extends SubtagArgumentType, Default>(name: Name, type: Type, options: RepeatedFallbackSubtagParameterOptions<Array<SubtagArgumentTypeMap[Type] | Default>>): NamedSubtagParameterDescriptor<Name, Array<SubtagArgumentTypeMap[Type] | Default>>;
    public static argument<Name extends string, Type extends SubtagArgumentType, Default>(name: Name, type: Type, options: OptionalSubtagParameterOptions<SubtagArgumentTypeMap[Type] | Default>): NamedSubtagParameterDescriptor<Name, SubtagArgumentTypeMap[Type] | Default>;
    public static argument<Name extends string, Type extends SubtagArgumentType, Default>(name: Name, type: Type, options: OptionalFallbackSubtagParameterOptions<SubtagArgumentTypeMap[Type] | Default>): NamedSubtagParameterDescriptor<Name, SubtagArgumentTypeMap[Type] | Default>;
    public static argument<T>(name: string, type: SubtagArgumentType, options?: AnySubtagParameterOptions<T>): NamedSubtagParameterDescriptor<string, T> {
        name;
        type;
        options;
        throw new Error('NotImplemented');
    }

    public static argumentGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>>(parameters: Parameters): SubtagParameterDescriptor<SubtagParameterGroupValue<Parameters>>;
    public static argumentGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>>(parameters: Parameters, options: RepeatedSubtagParameterGroupOptions): SubtagParameterDescriptor<Array<SubtagParameterGroupValue<Parameters>>>;
    public static argumentGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>, Result>(parameters: Parameters, options: MappedSubtagParameterGroupOptions<SubtagParameterGroupValue<Parameters>, Result>): SubtagParameterDescriptor<Result>;
    public static argumentGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>, Result>(parameters: Parameters, options: MappedRepeatedSubtagParameterGroupOptions<SubtagParameterGroupValue<Parameters>, Result>): SubtagParameterDescriptor<Result[]>;
    public static argumentGroup<T>(parameters: ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>, options?: AnySubtagParameterGroupOptions<T>): SubtagParameterDescriptor<unknown> {
        parameters;
        options;
        throw new Error('NotImplemented');
    }

    public static context(): SubtagParameterDescriptor<BBTagContext>;
    public static context<T>(getValue: (context: BBTagContext) => T): SubtagParameterDescriptor<T>;
    public static context(getValue?: (context: BBTagContext) => unknown): SubtagParameterDescriptor<unknown> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static guild(): SubtagParameterDescriptor<Guild>;
    public static guild<T>(getValue: (guild: Guild) => T): SubtagParameterDescriptor<T>;
    public static guild(getValue?: (guild: Guild) => unknown): SubtagParameterDescriptor<unknown> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static subtagAST(): SubtagParameterDescriptor<SubtagCall>;
    public static subtagAST<T>(getValue: (subtag: SubtagCall) => T): SubtagParameterDescriptor<T>;
    public static subtagAST(getValue?: (subtag: SubtagCall) => unknown): SubtagParameterDescriptor<unknown> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static subtagName(): SubtagParameterDescriptor<string>
    public static subtagName<T>(getValue: (name: string) => T): SubtagParameterDescriptor<T>
    public static subtagName(getValue?: (name: string) => unknown): SubtagParameterDescriptor<unknown> {
        getValue;
        throw new Error('NotImplemented');
    }

    public static quietArgument(): NamedSubtagParameterDescriptor<'quiet', boolean>;
    public static quietArgument<T extends string>(name: T): NamedSubtagParameterDescriptor<T, boolean>;
    public static quietArgument(name = 'quiet'): NamedSubtagParameterDescriptor<string, boolean> {
        name;
        throw new Error('NotImplemented');
    }

    public static useValue<T>(value: T): SubtagParameterDescriptor<T> {
        value;
        throw new Error('NotImplemented');
    }

    public static logger(): SubtagParameterDescriptor<Logger> {
        throw new Error('NotImplemented');
    }
}

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
    }

type SubtagReturnType = keyof SubtagReturnTypeMap;

type SubtagArgumentTypeMapCore = {
    'string': string;
    'integer': number;
    'number': number;
    'float': number;
    'color': number;
    'bigint': bigint;
    'duration': Duration;
    'boolean': boolean;
    'json': JToken; // uses bbtagutil.json.parse
    'user': User;
    'member': GuildMember;
    'channel': GuildChannels;
    'role': Role;
    'emoji': Emoji;
    'guildEmoji': GuildEmoji;
    'snowflake': string;
}
type SubtagArgumentTypeMap =
    & SubtagArgumentTypeMapCore
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}*`]: BBTagRef<SubtagArgumentTypeMapCore[P]> }
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}~`]: BBTagMaybeRef<SubtagArgumentTypeMapCore[P]> }
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}[]`]: Array<SubtagArgumentTypeMapCore[P]> }
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}[]*`]: BBTagRef<Array<SubtagArgumentTypeMapCore[P]>> }
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}[]~`]: BBTagMaybeRef<Array<SubtagArgumentTypeMapCore[P]>> }
    & {
        'deferred': () => Awaitable<string>;
        'ast': Statement;
        'json?': JToken | undefined;
        'source': string;
    }

type SubtagArgumentType = keyof SubtagArgumentTypeMap;

interface SubtagSignatureOptions {
    readonly description?: string;
    readonly exampleCode?: string;
    readonly exampleIn?: string;
    readonly exampleOut?: string;
}

interface BaseParseResult<T> {
    readonly success: boolean;
    readonly error?: string | BBTagRuntimeError;
    readonly value?: T;
}

interface ParseSuccess<T> extends BaseParseResult<T> {
    readonly success: true;
    readonly value: T;
}

interface ParseFailure<T> extends BaseParseResult<T> {
    readonly success: false;
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure<T>;

interface SubtagPrimitiveParameterOptions {
    readonly useFallback?: boolean;
}

type SubtagNumberParameterOptions = SubtagPrimitiveParameterOptions

interface SubtagBooleanParameterOptions extends SubtagPrimitiveParameterOptions {
    readonly mode?: 'parse' | 'notEmpty' | 'tryParseOrNotEmpty';
}

type TypeSpecificSubtagParameterOptions<Type> =
    & (Type extends number ? SubtagNumberParameterOptions : unknown)
    & (Type extends boolean ? SubtagBooleanParameterOptions : unknown)

type SubtagParameterOptions<Type> = TypeSpecificSubtagParameterOptions<Type> & {
    readonly isVariableName?: boolean | 'maybe';
    readonly guard?: (value: Type) => boolean; // TODO Make this able to narrow types
    readonly maxSourceLength?: number;
    readonly quietErrorDisplay?: string;
    readonly customError?: string | ((value: string) => BBTagRuntimeError | string);
}

type SubtagFallbackParameterOptions<Type> = SubtagParameterOptions<Type> & {
    readonly ifInvalid: Type | ((value: string) => ParseResult<Type>);
}

type RepeatedSubtagParameterOptions<Type> = SubtagParameterOptions<Type> & {
    readonly repeat: readonly [minCount: number, maxCount: number];
}

type RepeatedFallbackSubtagParameterOptions<Type> = RepeatedSubtagParameterOptions<Type> & SubtagFallbackParameterOptions<Type>;

type OptionalSubtagParameterOptions<Type> = SubtagParameterOptions<Type> & {
    readonly ifOmitted: Type;
}

type OptionalFallbackSubtagParameterOptions<Type> = OptionalSubtagParameterOptions<Type> & SubtagFallbackParameterOptions<Type>;

type AnySubtagParameterOptions<T> =
    | SubtagParameterOptions<T>
    | SubtagFallbackParameterOptions<T>
    | RepeatedSubtagParameterOptions<T>
    | RepeatedFallbackSubtagParameterOptions<T>
    | OptionalSubtagParameterOptions<T>
    | OptionalFallbackSubtagParameterOptions<T>

interface SubtagParameterDescriptor<T = unknown> {
    readonly minArgs: number;
    readonly maxArgs: number;
    readonly argGroupSize: number;
    readonly emitted: boolean;
    getValue(context: BBTagContext, subtag: SubtagCall, index: number): Awaitable<T>;

    /**
     * Marks this parameter as not needing to be sent to the implementation.
     * Generally this is just used for "swich" type arguments, used for looking up other values like roles/users/channels
     */
    noEmit(): this & NoEmitSubtagParameterDescriptor;
}

interface NoEmitSubtagParameterDescriptor {
    readonly emitted: false;
}

interface NamedSubtagParameterDescriptor<Name extends string, Type> extends SubtagParameterDescriptor<Type> {
    readonly name: Name;
}

interface RepeatedSubtagParameterGroupOptions {
    readonly repeat: readonly [minCount: number, maxCount: number];
}

interface MappedSubtagParameterGroupOptions<Source, Result> {
    readonly map: (source: Source) => Result;
}

interface MappedRepeatedSubtagParameterGroupOptions<Source, Result> extends RepeatedSubtagParameterGroupOptions, MappedSubtagParameterGroupOptions<Source, Result> {

}

type AnySubtagParameterGroupOptions<T> =
    | RepeatedSubtagParameterGroupOptions
    | MappedSubtagParameterGroupOptions<T, unknown>
    | MappedRepeatedSubtagParameterGroupOptions<T, unknown>

type ParameterType<T> = T extends SubtagParameterDescriptor<infer R> ? R : never;
type ParameterTypes<Parameters extends readonly unknown[]> = ParameterTypesHelper<ExcludeItem<Parameters, NoEmitSubtagParameterDescriptor>, readonly []>;
type ParameterTypesHelper<Remaining extends readonly unknown[], Result extends readonly unknown[]> =
    Remaining extends readonly [infer I, ...infer Rest]
    ? ParameterTypesHelper<Rest, readonly [...Result, ParameterType<I>]>
    : Result;

type SubtagSignatureDecorator<Return extends SubtagReturnType, Parameters extends readonly SubtagParameterDescriptor[]>
    = ConstrainedMethodDecorator<Subtag, ParameterTypes<Parameters>, Awaitable<SubtagReturnTypeMap[Return]>>

type SubtagParameterGroupValue<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>> = {
    [P in Parameters[number]as P['name']]: ReturnType<P['getValue']>
}
