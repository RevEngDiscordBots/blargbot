import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class AbsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'abs',
            category: SubtagType.MATH,
            aliases: ['absolute']
        });
    }

    @Subtag.signature('number[]', [
        Subtag.argument('numbers', 'number').repeat(2, Infinity)
    ], {
        description: 'Gets the absolute value of each `numbers` and returns an array containing the results',
        exampleCode: '{abs;-535;123;-42}',
        exampleOut: '[535, 123, 42]'
    })
    public absAll(values: number[]): number[] {
        return values.map(Math.abs);
    }

    @Subtag.signature('number', [
        Subtag.argument('number', 'number')
    ], {
        description: 'Gets the absolute value of `number`',
        exampleCode: '{abs;-535}',
        exampleOut: '535'
    })
    public abs(value: number): number {
        return Math.abs(value);
    }
}
