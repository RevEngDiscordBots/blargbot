import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RoundUpSubtag extends Subtag {
    public constructor() {
        super({
            name: 'roundup',
            aliases: ['ceil'],
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('value', 'number')
    ], {
        description: 'Rounds `number` up.',
        exampleCode: '{roundup;1.23}',
        exampleOut: '2'
    })
    public roundup(value: number): number {
        return Math.ceil(value);
    }
}
