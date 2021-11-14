import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class CommandNameSubtag extends Subtag {
    public constructor() {
        super({
            name: 'commandname',
            category: SubtagType.BOT,
            desc: 'Gets the name of the current tag or custom command.'
        });
    }

    @Subtag.signature('string', [
        Subtag.context()
    ], {
        exampleCode: 'This command is {commandname}',
        exampleIn: 'b!cc test',
        exampleOut: 'This command is test'
    })
    public getTagName(context: BBTagContext): string {
        return context.rootTagName;
    }
}
