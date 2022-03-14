import { DefinedSubtag } from '@blargbot/cluster/bbtag';
import { InvalidOperatorError, NotANumberError } from '@blargbot/cluster/bbtag/errors';
import { bbtag, parse, SubtagType } from '@blargbot/cluster/utils';

export class MathSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'math',
            category: SubtagType.MATH,
            definition: [
                {
                    parameters: ['operator', 'numbers+'],
                    description: 'Accepts multiple `values` and returns the result of `operator` on them. ' +
                        'Valid operators are `' + Object.keys(bbtag.numericOperators).join('`, `') + '`\n' +
                        'See `{operators}` for a shorter way of performing numeric operations.',
                    exampleCode: '2 + 3 + 6 - 2 = {math;-;{math;+;2;3;6};2}',
                    exampleOut: '2 + 3 + 6 - 2 = 9',
                    returns: 'number',
                    execute: (_, [operator, ...values]) => this.doMath(operator.value, values.map(arg => arg.value))
                }
            ]
        });
    }

    public doMath(
        operator: string,
        args: string[]
    ): number {
        if (!bbtag.isNumericOperator(operator))
            throw new InvalidOperatorError(operator);

        return bbtag.tagArray.flattenArray(args).map((arg) => {
            const argRaw = arg;
            if (typeof arg === 'string')
                arg = parse.float(arg);
            if (typeof arg !== 'number' || isNaN(arg))
                throw new NotANumberError(argRaw);
            return arg;
        }).reduce(bbtag.numericOperators[operator]);
    }
}