import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class GuildBansSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'guildbans',
            category: SubtagType.GUILD,
            desc: 'Returns an array of banned users in the current guild.',
            definition: [
                {
                    parameters: [],
                    exampleCode: 'This guild has {length;{guildbans}} banned users.',
                    exampleOut: 'This guild has 123 banned users.',
                    execute: (ctx) => this.getGuildBans(ctx)
                }
            ]
        });
    }

    public async getGuildBans(
        context: BBTagContext
    ): Promise<string> {
        try {
            return JSON.stringify((await context.guild.bans.fetch()).map(u => u.user.id));
        } catch (err: unknown) {
            throw new BBTagRuntimeError('Missing required permissions');
        }
    }
}
