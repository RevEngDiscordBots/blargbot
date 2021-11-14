import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class NsfwSubtag extends Subtag {
    public constructor() {
        super({
            name: 'nsfw',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('message', 'string', { ifOmitted: '❌ This contains NSFW content! Go to a NSFW channel. ❌' })
    ], {
        description: 'Marks the output as being NSFW, and only to be sent in NSFW channels. A requirement for any tag with NSFW content. `message` is the error to show',
        exampleCode: 'This command is not safe! {nsfw}',
        exampleOut: 'This command is not safe!'
    })
    public setNsfw(context: BBTagContext, message: string): void {
        context.state.nsfw = message;
    }
}
