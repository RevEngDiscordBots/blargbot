import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildIcon extends Subtag {
    public constructor() {
        super({
            name: 'guildicon',
            category: SubtagType.GUILD,
            desc: 'Returns the icon of the current guild. If it doesn\'t exist returns nothing.'
        });
    }

    @Subtag.signature('string?', [
        Subtag.guild()
    ], {
        exampleCode: 'The guild\'s icon is {guildicon}',
        exampleOut: 'The guild\'s icon is (icon url)'
    })
    public getGuildIcon(guild: Guild): string | undefined {
        return guild.iconURL({ size: 512, format: 'png', dynamic: true }) ?? undefined;
    }
}
