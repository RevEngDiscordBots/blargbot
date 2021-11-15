import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildOwnerIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildownerid',
            category: SubtagType.GUILD,
            desc: 'Returns the id of the guild\'s owner.'
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.guild()
    ], {
        exampleCode: 'The owner\'s id is {guildownerid}.',
        exampleOut: 'The owner\'s id is 1234567890123456.'
    })
    public getGuildOwnerId(guild: Guild): string {
        return guild.ownerId;
    }
}
