import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { encode } from 'html-entities';

export class HtmlDecodeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'htmlencode',
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string', { repeat: [1, Infinity] })
    ], {
        description: 'Encodes `text` with escaped html entities.',
        exampleCode: '{htmlencode;<hello, world>}',
        exampleOut: '&lt;hello, world&gt;'
    })
    public htmlEncode(html: string[]): string {
        return encode(html.join(';'));
    }
}
