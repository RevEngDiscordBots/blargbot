import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { decode } from 'html-entities';

export class HtmlDecodeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'htmldecode',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Decodes html entities from `text`.',
        exampleCode: '{htmldecode;&lt;hello, world&gt;}',
        exampleOut: '<hello, world>'
    })
    public htmlDecode(text: string): string {
        return decode(text);
    }
}
