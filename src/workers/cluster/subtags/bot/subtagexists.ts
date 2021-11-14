import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SubtagExistsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'subtagexists',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('subtag', 'string')
    ], {
        description: 'Checks to see if `subtag` exists.',
        exampleIn: '{subtagexists;ban} {subtagexists;AllenKey}',
        exampleOut: 'true false'
    })
    public subtagExists(context: BBTagContext, name: string): boolean {
        return context.subtags.get(name) !== undefined;
    }
}
