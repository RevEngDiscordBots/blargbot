import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class FlagsArraySubtag extends Subtag {
    public constructor() {
        super({
            name: 'flagsarray',
            category: SubtagType.BOT,
            desc: 'Returns an array of all flags provided.'
        });
    }

    @Subtag.signature('string[]', [
        Subtag.context()
    ], {
        exampleCode: '{flagsarray}',
        exampleIn: 'Hello -dc world',
        exampleOut: '["_","d","c"]'
    })
    public flagKeys(context: BBTagContext): string[] {
        return Object.keys(context.flaggedInput);
    }
}
