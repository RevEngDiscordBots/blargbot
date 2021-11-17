import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class TrimSubtag extends Subtag {
    public constructor() {
        super({
            name: 'trim',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Trims whitespace and newlines before and after `text`.',
        exampleCode: 'Hello {trim;{space;10}beautiful{space;10}} World',
        exampleOut: 'Hello beautiful World'
    })
    public trim(text: string): string {
        return text.trim();
    }
}
