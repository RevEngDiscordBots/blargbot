import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class MathSubtag extends Subtag {
    public constructor() {
        super({
            name: 'math',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('operator', 'string'),
        Subtag.argument('numbers', 'number', { repeat: [1, Infinity], flattenArrays: true })
    ], {
        description: 'Accepts multiple `values` and returns the result of `operator` on them. ' +
            'Valid operators are `' + Object.keys(bbtagUtil.operators.numeric).join('`, `') + '`\n' +
            'See `{operators}` for a shorter way of performing numeric operations.',
        exampleCode: '2 + 3 + 6 - 2 = {math;-;{math;+;2;3;6};2}',
        exampleOut: '2 + 3 + 6 - 2 = 9'
    })
    public doMath(operator: string, args: number[]): number {
        if (!bbtagUtil.operators.isNumericOperator(operator))
            throw new BBTagRuntimeError('Invalid operator', operator + ' is not an operator');

        return args.reduce(bbtagUtil.operators.numeric[operator]);
    }
}
