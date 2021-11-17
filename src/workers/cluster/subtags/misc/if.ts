import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';

const operators = bbtagUtil.operators.compare;

export class IfSubtag extends Subtag {
    public constructor() {
        super({
            name: 'if',
            category: SubtagType.MISC,
            desc:
                'If `operator` and `value2` are provided, `value1` is evaluated against `value2` using `operator`. ' +
                'If they are not provided, `value1` is read as `true` or `false`. ' +
                'If the resulting value is `true` then the tag executes `then`, otherwise it executes `else`.\n' +
                'Valid operators are `' + Object.keys(operators).join('`, `') + '`.'
        });
    }

    public simpleBooleanCheck(bool: boolean, thenCode: () => Awaitable<string>): Promise<string | undefined>;
    public simpleBooleanCheck(bool: boolean, thenCode: () => Awaitable<string>, elseCode: () => Awaitable<string>): Promise<string>;
    public simpleBooleanCheck(bool: boolean, thenCode: () => Awaitable<string>, elseCode?: () => Awaitable<string>): Promise<string | undefined>;

    @Subtag.signature('string?', [
        Subtag.argument('boolean', 'boolean'),
        Subtag.argument('then', 'deferred')
    ], {
        description: 'If `boolean` is `true`, return `then`, else do nothing.'
    })
    @Subtag.signature('string', [
        Subtag.argument('boolean', 'boolean'),
        Subtag.argument('then', 'deferred'),
        Subtag.argument('else', 'deferred')
    ], {
        description: 'If `boolean` is `true`, return `then`, else execute `else`'
    })
    public async simpleBooleanCheck(bool: boolean, thenCode: () => Awaitable<string>, elseCode?: () => Awaitable<string>): Promise<string | undefined> {
        return bool ? await thenCode() : await elseCode?.();
    }

    public evaluatorCheck(value1: string, evaluator: string, value2: string, thenCode: () => Awaitable<string>): Promise<string | undefined>;
    public evaluatorCheck(value1: string, evaluator: string, value2: string, thenCode: () => Awaitable<string>, elseCode: () => Awaitable<string>): Promise<string>;
    public evaluatorCheck(value1: string, evaluator: string, value2: string, thenCode: () => Awaitable<string>, elseCode?: () => Awaitable<string>): Promise<string | undefined>;

    @Subtag.signature('string?', [
        Subtag.argument('value1', 'string'),
        Subtag.argument('operator', 'string'),
        Subtag.argument('value2', 'string'),
        Subtag.argument('then', 'deferred')
    ], {
        description: '`Value1` is evaluated against `value2` using `operator`, if the resulting value is `true` then the tag executes `then`, otherwise it does nothing'
    })
    @Subtag.signature('string', [
        Subtag.argument('value1', 'string'),
        Subtag.argument('operator', 'string'),
        Subtag.argument('value2', 'string'),
        Subtag.argument('then', 'deferred'),
        Subtag.argument('else', 'deferred')
    ], {
        description: '`Value1` is evaluated against `value2` using `operator`, if the resulting value is `true` then the tag executes `then`, otherwise it executes `else`'
    })
    public async evaluatorCheck(value1: string, evaluator: string, value2: string, thenCode: () => Awaitable<string>, elseCode?: () => Awaitable<string>): Promise<string | undefined> {
        let operator;
        if (bbtagUtil.operators.isCompareOperator(evaluator)) {
            operator = evaluator;
        } else if (bbtagUtil.operators.isCompareOperator(value1)) {
            operator = value1;
            [value1, evaluator] = [evaluator, value1];
        } else if (bbtagUtil.operators.isCompareOperator(value2)) {
            operator = value2;
            [evaluator, value2] = [value2, evaluator];
        } else {
            throw new BBTagRuntimeError('Invalid operator');
        }
        const leftBool = parse.boolean(value1, undefined, false);
        if (leftBool !== undefined)
            value1 = leftBool.toString();

        const rightBool = parse.boolean(value2, undefined, false);
        if (rightBool !== undefined)
            value2 = rightBool.toString();

        return operators[operator](value1, value2) ? await thenCode() : await elseCode?.();
    }
}
