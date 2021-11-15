import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ChannelIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelid',
            aliases: ['categoryid'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Returns the ID of the current channel.',
        exampleCode: '{channelid}',
        exampleOut: '111111111111111'
    })
    @Subtag.signature('snowflake', [
        Subtag.argument('channel', 'channel', { quietErrorDisplay: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the ID of the given channel. If it cannot be found returns `No channel found`, or nothing if `quiet` is `true`.',
        exampleCode: '{channelid;cool channel}\n{channelid;some channel that doesn\'t exist;true}',
        exampleOut: '111111111111111\n(nothing is returned here)'
    })
    public getChannelId(channel: GuildChannels): string {
        return channel.id;
    }
}
