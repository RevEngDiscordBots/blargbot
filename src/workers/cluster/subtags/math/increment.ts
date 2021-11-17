import { Subtag } from '@cluster/bbtag';
import { BBTagRef } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class IncrementSubtag extends Subtag {
    public constructor() {
        super({
            name: 'increment',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('variable', 'number*'),
        Subtag.argument('amount', 'number').ifOmittedUse(1),
        Subtag.argument('floor', 'boolean').ifOmittedUse(true)
    ], {
        description: 'Increases `varName`\'s value by `amount`. ' +
            'If `floor` is `true` then the value will be rounded down.',
        exampleCode: '{set;~counter;0} {repeat;{decrement;~counter;-2},;10}',
        exampleOut: '-2,-4,-6,-8,-10,-12,-14,-16,-18,-20'
    })
    public increment(variable: BBTagRef<number>, amount: number, floor: boolean): number {
        let value = variable.get();
        if (floor) {
            value = Math.floor(value);
            amount = Math.floor(amount);
        }

        variable.set(value += amount);
        return value;
    }
}
