import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ChannelTypeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channeltype',
            category: SubtagType.CHANNEL,
            desc: 'Possible results: ' + Object.values(channelTypes).map(t => '`' + t + '`').join(', ')
        });
    }

    @Subtag.signature('string', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Returns the type the current channel.',
        exampleCode: '{channeltype}',
        exampleOut: 'text'
    })
    @Subtag.signature('string', [
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the type the given `channel`. If it cannot be found returns `No channel found`, or nothing if `quiet` is `true`.',
        exampleCode: '{channeltype;cool channel}\n{channeltype;some channel that doesn\'t exist;true}',
        exampleOut: 'voice\n(nothing is returned here)'
    })
    public getChannelType(channel: GuildChannels): typeof channelTypes[keyof typeof channelTypes] {
        return channelTypes[channel.type];
    }
}

const channelTypes = {
    ['GUILD_TEXT']: 'text',
    ['DM']: 'dm',
    ['GUILD_VOICE']: 'voice',
    ['GROUP_DM']: 'group-dm',
    ['GUILD_CATEGORY']: 'category',
    ['GUILD_NEWS']: 'news',
    ['GUILD_STORE']: 'store',
    ['GUILD_NEWS_THREAD']: 'news-thread',
    ['GUILD_PRIVATE_THREAD']: 'private-thread',
    ['GUILD_PUBLIC_THREAD']: 'public-thread',
    ['GUILD_STAGE_VOICE']: 'stage-voice',
    ['UNKNOWN']: 'unknown'
} as const;
