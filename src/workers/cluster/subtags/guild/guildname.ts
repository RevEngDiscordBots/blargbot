import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildNameSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildname',
            category: SubtagType.GUILD,
            desc: 'Returns the name of the current guild.'
        });
    }

    @Subtag.signature('string', [
        Subtag.guild()
    ], {
        exampleCode: 'This guild\'s name is {guildname}.',
        exampleOut: 'This guild\'s name is TestGuild.'
    })
    public getGuildName(guild: Guild): string {
        return guild.name;
    }
}
