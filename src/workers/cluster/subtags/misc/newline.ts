import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class NewlineSubtag extends Subtag {
    public constructor() {
        super({
            name: 'newline',
            aliases: ['n'],
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('count', 'integer', { useFallback: true }).ifOmittedUse(1)
    ], {
        description: 'Will be replaced by `count` newline characters (\\n).',
        exampleCode: 'Hello,{newline}world!',
        exampleOut: 'Hello,\nworld!'
    })
    public getNewlines(count: number): string {
        // TODO: limit count
        return ''.padStart(count < 0 ? 0 : count, '\n');
    }
}
