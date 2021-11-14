import { AnySubtagHandlerDefinition, BBTagArray, BBTagMaybeRef, BBTagRef, CompositeSubtagHandler, SubtagCall, SubtagHandlerCallSignature, SubtagOptions, SubtagResult } from '@cluster/types';
import { SubtagType } from '@cluster/utils';
import { metrics } from '@core/Metrics';
import { Timer } from '@core/Timer';
import { MessageEmbedOptions } from 'discord.js';

import { BBTagContext } from './BBTagContext';
import { compileSignatures, parseDefinitions } from './compilation';
import { BBTagRuntimeError } from './errors';

export abstract class Subtag implements SubtagOptions {
    public readonly name: string;
    public readonly aliases: readonly string[];
    public readonly category: SubtagType;
    public readonly isTag: true;
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
        this.isTag = true;
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

    public static signature<Return extends SubtagReturnType>(
        returns: Return,
        details?: SubtagSignatureOptions
    ): SubtagSignatureDecorator<Return, []>;
    public static signature<Return extends SubtagReturnType, Parameters extends readonly SubtagParameterDescriptor[] | []>(
        returns: Return,
        parameters: Parameters,
        details?: SubtagSignatureOptions
    ): SubtagSignatureDecorator<Return, Parameters>;

    public static parameter<Name extends string, Type extends SubtagArgumentType>(name: Name, type: Type, options?: SubtagParameterOptions<Type>): NamedSubtagParameterDescriptor<Name, SubtagArgumentTypeMap[Type]>;
    public static parameter<Name extends string, Type extends SubtagArgumentType>(name: Name, type: Type, options: RepeatedSubtagParameterOptions<Type>): NamedSubtagParameterDescriptor<Name, Array<SubtagArgumentTypeMap[Type]>>;
    public static parameter<Name extends string, Type extends SubtagArgumentType, Default>(name: Name, type: Type, options: OptionalSubtagParameterOptions<Type, Default>): NamedSubtagParameterDescriptor<Name, SubtagArgumentTypeMap[Type] | Default>;

    public static parameterGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>>(parameters: Parameters): SubtagParameterDescriptor<SubtagParameterGroupValue<Parameters>>;
    public static parameterGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>>(parameters: Parameters, options: RepeatedSubtagParameterGroupOptions): SubtagParameterDescriptor<Array<SubtagParameterGroupValue<Parameters>>>;
    public static parameterGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>, Result>(parameters: Parameters, options: MappedSubtagParameterGroupOptions<SubtagParameterGroupValue<Parameters>, Result>): SubtagParameterDescriptor<Result>;
    public static parameterGroup<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>, Result>(parameters: Parameters, options: MappedRepeatedSubtagParameterGroupOptions<SubtagParameterGroupValue<Parameters>, Result>): SubtagParameterDescriptor<Result[]>;

    public static readonly context: SubtagParameterDescriptor<BBTagContext>;
    public static context(): SubtagParameterDescriptor<BBTagContext>;
    public static context<T>(getValue: (context: BBTagContext) => T): SubtagParameterDescriptor<T>;

    public static readonly subtagCode: SubtagParameterDescriptor<SubtagCall>;
    public static subtagCode(): SubtagParameterDescriptor<SubtagCall>;
    public static subtagCode<T>(getValue: (subtag: SubtagCall) => T): SubtagParameterDescriptor<T>;

    public static readonly subtagName: SubtagParameterDescriptor<string>;

    public static useValue<T>(value: T): SubtagParameterDescriptor<T>;
}

type Iterated<T> = Iterable<T> | AsyncIterable<T>;

type SubtagReturnTypeMap = {
    'string': string;
    'string[]': Iterated<string>;
    'nothing': void;
    'json|nothing': JToken | undefined;
    'json[]': JArray;
    'json[]|nothing': JArray | undefined;
    'boolean': boolean;
    '(string|error)[]': Iterated<JToken>;
}

type SubtagReturnType = keyof SubtagReturnTypeMap;

type SubtagArgumentTypeMapCore = {
    'string': string;
    'integer': number;
    'number': number;
    'float': number;
    'boolean': boolean;
    'json[]': JArray;
}
type SubtagArgumentTypeMap =
    & SubtagArgumentTypeMapCore
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}*`]: BBTagRef<SubtagArgumentTypeMapCore[P]> }
    & { [P in keyof SubtagArgumentTypeMapCore as `${P}~`]: BBTagMaybeRef<SubtagArgumentTypeMapCore[P]> }
    & {
        'deferred': () => Awaitable<string>;
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

interface SubtagPrimitiveParameterOptions<T> {
    readonly useFallback?: boolean;
    readonly ifInvalid?: (value: string) => ParseResult<T>;
}

type SubtagStringParameterOptions = unknown;

type SubtagNumberParameterOptions = SubtagPrimitiveParameterOptions<number>
interface SubtagBooleanParameterOptions extends SubtagPrimitiveParameterOptions<boolean> {
    readonly mode?: 'parse' | 'notEmpty' | 'tryParseOrNotEmpty';
}

type TypeSpecificSubtagParameterOptions<Type> =
    & (Type extends number ? SubtagNumberParameterOptions : unknown)
    & (Type extends string ? SubtagStringParameterOptions : unknown)
    & (Type extends boolean ? SubtagBooleanParameterOptions : unknown)

type SubtagParameterOptions<Type extends SubtagArgumentType> = TypeSpecificSubtagParameterOptions<SubtagArgumentTypeMap[Type]> & {
    readonly isVariableName?: boolean | 'maybe';
}

type RepeatedSubtagParameterOptions<Type extends SubtagArgumentType> = SubtagParameterOptions<Type> & {
    readonly repeat: readonly [minCount: number, maxCount: number];
}

type OptionalSubtagParameterOptions<Type extends SubtagArgumentType, Default> = SubtagParameterOptions<Type> & {
    readonly default: Default;
}

interface SubtagParameterDescriptor<T = unknown> {
    getValue(context: BBTagContext, subtag: SubtagCall): Awaitable<T>;
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

type ParameterType<T> = T extends SubtagParameterDescriptor<infer R> ? R : never;
type ParameterTypes<Parameters> = { [P in keyof Parameters]: ParameterType<Parameters[P]>; }

type SubtagSignatureDecorator<Return extends SubtagReturnType, Parameters extends readonly SubtagParameterDescriptor[]>
    = ConstrainedMethodDecorator<Subtag, ParameterTypes<Parameters>, Awaitable<SubtagReturnTypeMap[Return]>>

type SubtagParameterGroupValue<Parameters extends ReadonlyArray<NamedSubtagParameterDescriptor<string, unknown>>> = {
    [P in Parameters[number]as P['name']]: ReturnType<P['getValue']>
}
