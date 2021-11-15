import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class MaxSubtag extends Subtag {
    public constructor() {
        super({
            name: 'max',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('numbers', 'number', { repeat: [1, Infinity], flattenArrays: true, ifInvalid: NaN })
    ], {
        description: 'Returns the largest entry out of `numbers`. If an array is provided, it will be expanded to its individual values.',
        exampleCode: '{max;50;2;65}',
        exampleOut: '65'
    })
    public max(values: number[]): number {
        return Math.max(...values);
    }
}
