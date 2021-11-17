import { Subtag } from '@cluster/bbtag';
import { InvalidOperatorError } from '@cluster/bbtag/errors';
import { bbtagUtil, SubtagType } from '@cluster/utils';
import { NumericOperator } from '@cluster/utils/bbtag/operators';

export class MathSubtag extends Subtag {
    public constructor() {
        super({
            name: 'math',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('operator', 'string').guard(Object.keys(bbtagUtil.operators.numeric), value => new InvalidOperatorError(value, 'numeric')),
        Subtag.argument('numbers', 'number').repeat(1, Infinity, 'flatten')
    ], {
        description: 'Accepts multiple `values` and returns the result of `operator` on them. ' +
            'Valid operators are `' + Object.keys(bbtagUtil.operators.numeric).join('`, `') + '`\n' +
            'See `{operators}` for a shorter way of performing numeric operations.',
        exampleCode: '2 + 3 + 6 - 2 = {math;-;{math;+;2;3;6};2}',
        exampleOut: '2 + 3 + 6 - 2 = 9'
    })
    public doMath(operator: NumericOperator, args: number[]): number {
        return args.reduce(bbtagUtil.operators.numeric[operator]);
    }
}
