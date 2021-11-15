import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RoundSubtag extends Subtag {
    public constructor() {
        super({
            name: 'round',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('number', 'number')
    ], {
        description: 'Rounds `number` to the nearest whole number.',
        exampleCode: '{round;1.23}',
        exampleOut: '1'
    })
    public round(value: number): number {
        return Math.round(value);
    }
}
