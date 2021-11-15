import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildid',
            category: SubtagType.GUILD,
            desc: 'Returns the id of the current guild.'
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.guild()
    ], {
        exampleCode: 'The guild\'s id is {guildid}',
        exampleOut: 'The guild\'s id is 1234567890123456'
    })
    public getGuildId(guild: Guild): string {
        return guild.id;
    }
}
