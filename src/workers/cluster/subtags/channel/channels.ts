import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild, GuildChannels } from 'discord.js';

export class ChannelsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channels',
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.context(ctx => ctx.guild)
    ], {
        description: 'Returns an array of channel IDs in the current guild',
        exampleCode: 'This guild has {length;{channels}} channels.',
        exampleOut: 'This guild has {length;{channels}} channels.'
    })
    public getChannels(guild: Guild): string[] {
        return guild.channels.cache.map(c => c.id);
    }

    @Subtag.signature('snowflake[]', [
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns an array of channel IDs in within the given `category`. If `category` is not a category, returns an empty array. If `category` cannot be found returns `No channel found`, or nothing if `quiet` is `true`.',
        exampleCode: 'Category cat-channels has {length;{channels;cat-channels}} channels.',
        exampleOut: 'Category cat-channels has 6 channels.'
    })
    public getChannelsInCategory(category: GuildChannels): string[] {
        if (category.type !== 'GUILD_CATEGORY')
            return [];
        return category.children.map(c => c.id);
    }
}
