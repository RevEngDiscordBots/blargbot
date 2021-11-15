import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildBansSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildbans',
            category: SubtagType.GUILD,
            desc: 'Returns an array of banned users in the current guild.'
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.guild()
    ], {
        exampleCode: 'This guild has {length;{guildbans}} banned users.',
        exampleOut: 'This guild has 123 banned users.'
    })
    public async getGuildBans(guild: Guild): Promise<string[]> {
        try {
            return (await guild.bans.fetch()).map(u => u.user.id);
        } catch (err: unknown) {
            throw new BBTagRuntimeError('Missing required permissions');
        }
    }
}
