import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RoundDownSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rounddown',
            aliases: ['floor'],
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('number', 'number')
    ], {
        description: 'Rounds `number` down.',
        exampleCode: '{rounddown;1.23}',
        exampleOut: '1'
    })
    public rounddown(value: number): number {
        return Math.floor(value);
    }
}
