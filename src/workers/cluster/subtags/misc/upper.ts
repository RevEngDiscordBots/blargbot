import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class UpperSubtag extends Subtag {
    public constructor() {
        super({
            name: 'upper',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Returns `text` as uppercase.',
        exampleCode: '{upper;this will become uppercase}',
        exampleOut: 'THIS WILL BECOME UPPERCASE'
    })
    public uppercase(text: string): string {
        return text.toUpperCase();
    }
}
