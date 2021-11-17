import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class Base64encodeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'base64encode',
            aliases: ['btoa'],
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
        description: 'Converts the provided text to base64.',
        exampleCode: '{base64decode;Fancy!}',
        exampleOut: 'RmFuY3kh!'
    })
    public encode(text: string): string {
        return Buffer.from(text).toString('base64');
    }
}
