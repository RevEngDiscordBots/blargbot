import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class UriDecodeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'uridecode',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Decodes `text` from URI format.',
        exampleCode: '{uridecode;Hello%20world}',
        exampleOut: 'Hello world!'
    })
    public decodeUri(text: string): string {
        return decodeURIComponent(text);
    }
}
