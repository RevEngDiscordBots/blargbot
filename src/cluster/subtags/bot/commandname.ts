import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { SubtagType } from '@blargbot/cluster/utils';

export class CommandNameSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'commandname',
            category: SubtagType.BOT,
            desc: 'Gets the name of the current tag or custom command.',
            definition: [
                {
                    parameters: [],
                    exampleCode: 'This command is {commandname}',
                    exampleIn: 'b!cc test',
                    exampleOut: 'This command is test',
                    returns: 'string',
                    execute: (ctx) => this.getTagName(ctx)
                }
            ]
        });
    }

    public getTagName(context: BBTagContext): string {
        return context.rootTagName;
    }
}