import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';

const operators = bbtagUtil.operators.compare;

export class BoolSubtag extends Subtag {
    public constructor() {
        super({
            name: 'bool',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('boolean', [
        Subtag.argument('left', 'string'),
        Subtag.argument('operator', 'string'),
        Subtag.argument('right', 'string')
    ], {
        description:
            'Evaluates `left` and `right` using the `operator`. ' +
            'Valid operators are `' + Object.keys(operators).join('`, `') + '`\n' +
            'The positions of `operator` and `left` can be swapped.',
        exampleCode: '{bool;5;<=;10}',
        exampleOut: 'true'
    })
    public runCondition(left: string, evaluator: string, right: string): boolean {
        let operator;
        if (bbtagUtil.operators.isCompareOperator(evaluator)) {
            operator = evaluator;
        } else if (bbtagUtil.operators.isCompareOperator(left)) {
            operator = left;
            [left, operator] = [operator, left];
        } else if (bbtagUtil.operators.isCompareOperator(right)) {
            operator = right;
            [operator, right] = [right, operator];
        } else {
            throw new BBTagRuntimeError('Invalid operator');
        }

        const leftBool = parse.boolean(left, undefined, false);
        if (leftBool !== undefined)
            left = leftBool.toString();
        const rightBool = parse.boolean(right, undefined, false);
        if (rightBool !== undefined)
            right = rightBool.toString();

        return operators[operator](left, right);
    }
}
