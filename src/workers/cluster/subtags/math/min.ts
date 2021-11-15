import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class MinSubtag extends Subtag {
    public constructor() {
        super({
            name: 'min',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('numbers', 'number', { repeat: [1, Infinity], flattenArrays: true, ifInvalid: NaN })
    ], {
        description: 'Returns the smallest entry out of `numbers`. If an array is provided, it will be expanded to its individual values.',
        exampleCode: '{min;50;2;65}',
        exampleOut: '2'
    })
    public min(values: number[]): number {
        return Math.min(...values);
    }
}
