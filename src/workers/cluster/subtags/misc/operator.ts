import { Subtag } from '@cluster/bbtag';
import { InvalidOperatorError } from '@cluster/bbtag/errors';
import { bbtagUtil, SubtagType } from '@cluster/utils';
import { LogicOperator, NumericOperator, OrdinalCompareOperator, StringCompareOperator } from '@cluster/utils/bbtag/operators';

export class OperatorSubtag extends Subtag {
    public constructor() {
        super({
            name: 'operator',
            aliases: Object.keys(allOperators),
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('error', [
        Subtag.subtagName(),
        Subtag.argument('values', 'string').repeat(1, Infinity)
    ], { hidden: true })
    public invalidOperator(operatorName: string): never {
        throw new InvalidOperatorError(operatorName);
    }

    @Subtag.signature('number', [
        Subtag.subtagName().guard(numericOperators, val => new InvalidOperatorError(val, 'numeric')),
        Subtag.argument('values', 'number').repeat(1, Infinity, 'flatten')
    ], {
        description: 'Numeric operators have the exact same behaviour as the operators in `{math}`. ',
        exampleCode: '1 + 2 + 3 = {+;1;2;3}\n1 * 2 * 3 * 4 = {*;1;2;3;4}\n(6 / 3) / 0.1 = {/;6;3;0.1}\n(2^6)^2 = {^;2;6;2}',
        exampleOut: '1 + 2 + 3 = 6\n1 * 2 * 3 * 4 = 24\n(6 / 3) / 0.1 = 20\n(2^6)^2 = 4096'
    })
    public invokeNumericOperator(operator: NumericOperator, values: number[]): number {
        return values.reduce(numeric[operator]);
    }

    @Subtag.signature('boolean', [
        Subtag.subtagName().guard(logicOperators, val => new InvalidOperatorError(val, 'logic')),
        Subtag.argument('values', 'boolean').repeat(1, Infinity, 'flatten')
    ], {
        description: 'Logic operators have the exact same behaviour as the operators in `{logic}`, with the exception of `^` which is a numeric operator.',
        exampleCode: 'false && true && false = {&&;false;true;false}\nfalse || true = {||;false;true}\n!true = {!;true}',
        exampleOut: 'false && true && false = false\nfalse || true = true\n!true = false'
    })
    public invokeLogicOperator(operator: LogicOperator, values: boolean[]): boolean {
        return logic[operator](values);
    }

    @Subtag.signature('boolean', [
        Subtag.subtagName().guard(stringCompareOperators, val => new InvalidOperatorError(val, 'comparison')),
        Subtag.argument('values', 'string').repeat(1, Infinity)
    ], {
        description: 'String comparison operators behave in a similar way to `{bool}`, but can accept more than two values. Because it can accept more than two values the logic is a little different.',
        exampleCode: '("abc".includes("a") && "abc".includes("b") && "abc".includes("c")) = {includes;abc;a;b;c}\n(["1","2","3"][0] == "1" && ["1","2","3"][0] == \'"1","2"\') = {startswith;["1","2","3"];1;"1","2"}',
        exampleOut: '("abc".includes("a") && "abc".includes("b") && "abc".includes("c")) = true\n(["1","2","3"][0] == "1" && ["1","2","3"][0] == \'"1","2"\') = false'
    })
    public invokeStringCompareOperator(operator: StringCompareOperator, values: string[]): boolean {
        if (values.length <= 1)
            return false;

        return values.slice(1)
            .map(v => stringCompare[operator](values[0], v))
            .reduce((l, r) => l && r);
    }

    @Subtag.signature('boolean', [
        Subtag.subtagName().guard(numberCompareOperators, val => new InvalidOperatorError(val, 'comparison')),
        Subtag.argument('values', 'string').repeat(1, Infinity, 'flatten')
    ], {
        description: 'Comparison operators behave in a similar way to `{bool}`, but can accept more than two values. If an argument is an array, this array will be flattened (except for `startswith, includes, contains and endswith`). Because it can accept more than two values the logic is a little different.',
        exampleCode: '(1 == 2 && 2 == 3 && 3 == 4) = {==;1;2;3;4}\n(3 > 2 && 2 > 1 && 1 > 0) = {>;3;2;1}',
        exampleOut: '(1 == 2 && 2 == 3 && 3 == 4) = false\n(3 > 2 && 2 > 1 && 1 > 0) = true'
    })
    public invokeNumericCompareOperator(operator: OrdinalCompareOperator, values: string[]): boolean {
        if (values.length <= 1)
            return false;

        return values.slice(1)
            .map((v, i) => ordinalCompare[operator](values[i - 1], v))
            .reduce((l, r) => l && r);
    }
}

const { all: allOperators, logic, numeric, stringCompare, ordinalCompare } = bbtagUtil.operators;

const logicOperators = Object.keys(logic).filter((value): value is Exclude<LogicOperator, '^'> => value !== '^');
const numericOperators = Object.keys(numeric);
const stringCompareOperators = Object.keys(stringCompare);
const numberCompareOperators = Object.keys(ordinalCompare);
