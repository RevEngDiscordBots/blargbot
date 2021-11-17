import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class UriEncodeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'uriencode',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Encodes `text` in URI format. Useful for constructing links.',
        exampleCode: '{uriencode;Hello world!}',
        exampleOut: 'Hello%20world!'
    })
    public encodeUri(text: string): string {
        return decodeURIComponent(text);
    }
}
