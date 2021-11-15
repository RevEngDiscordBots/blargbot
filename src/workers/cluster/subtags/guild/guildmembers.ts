import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildMembersSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildmembers',
            category: SubtagType.GUILD,
            desc: 'Returns an array of user IDs of the members on the current guild. This only includes **cached** members, for getting the amount of members in a guild **always** use `{guildsize}`'
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.guild()
    ], {
        exampleCode: 'This guild has {length;{guildmembers}} cached members.',
        exampleOut: 'This guild has 123 cached members.'
    })
    public getGuildMembers(guild: Guild): string[] {
        return guild.members.cache.map(m => m.user.id);
    }
}
