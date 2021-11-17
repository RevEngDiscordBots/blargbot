import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class Base64decodeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'base64decode',
            aliases: ['atob'],
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('rest', 'string').repeat(1, Infinity)
    ], { hidden: true })
    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Converts the provided base64 to a UTF-8 string.',
        exampleCode: '{base64decode;RmFuY3kh}',
        exampleOut: 'Fancy!'
    })
    public decode(base64: string): string {
        return Buffer.from(base64, 'base64').toString();
    }
}
