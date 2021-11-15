import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildSizeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildsize',
            aliases: ['inguild'],
            category: SubtagType.GUILD,
            desc: 'Returns the number of members on the current guild.'
        });
    }

    @Subtag.signature('integer', [
        Subtag.guild()
    ], {
        exampleCode: 'This guild has {guildsize} members.',
        exampleOut: 'This guild has 123 members.'
    })
    public getGuildMemberCount(guild: Guild): number {
        return guild.memberCount;
    }
}
