import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class GuildOwnerIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildownerid',
            category: SubtagType.GUILD,
            desc: 'Returns the id of the guild\'s owner.',
            definition: [
                {
                    parameters: [],
                    exampleCode: 'The owner\'s id is {guildownerid}.',
                    exampleOut: 'The owner\'s id is 1234567890123456.',
                    returns: 'id',
                    execute: (ctx) => this.getGuildOwnerId(ctx)
                }
            ]
        });
    }

    public getGuildOwnerId(context: BBTagContext): string {
        return context.guild.ownerId;
    }
}
