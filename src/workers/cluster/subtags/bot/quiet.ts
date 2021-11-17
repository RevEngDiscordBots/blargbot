import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class QuietSubtag extends Subtag {
    public constructor() {
        super({
            name: 'quiet',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('isQuiet', 'boolean').catch().allowOmitted()
    ], {
        description: 'Tells any subtags that rely on a `quiet` field to be/not be quiet based on `isQuiet. `isQuiet` must be a boolean',
        exampleCode: '{quiet} {usermention;cat}',
        exampleOut: 'cat'
    })
    public setQuiet(context: BBTagContext, quiet: boolean | undefined): void {
        context.scopes.local.quiet = quiet;
    }
}
