import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class GuildFeaturesSubtag extends Subtag {
    public constructor() {
        super({
            name: 'guildfeatures',
            aliases: ['features'],
            category: SubtagType.GUILD
        });
    }

    @Subtag.signature('string[]', [
        Subtag.guild()
    ], {
        description: 'Returns an array of guild feature strings. For a full list click [this link](https://discord.com/developers/docs/resources/guild#guild-object-guild-features).',
        exampleCode: '{guildfeatures}',
        exampleOut: '["COMMUNITY","COMMERCE","NEWS","PREVIEW_ENABLED","WELCOME_SCREEN_ENABLED","MEMBER_VERIFICATION_GATE_ENABLED","THREADS_ENABLED"]'
    })
    public getGuildFeatures(guild: Guild): string[] {
        return guild.features;
    }
}
