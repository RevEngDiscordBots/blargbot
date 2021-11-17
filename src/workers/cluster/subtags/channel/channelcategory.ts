import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ChannelCategorySubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelcategory',
            aliases: ['category'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Returns the category ID of the current channel.',
        exampleCode: '{channelcategory}',
        exampleOut: '111111111111111'
    })
    @Subtag.signature('snowflake', [
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the category ID of the provided `channel`. If the provided `channel` is a category this returns nothing. If it cannot be found returns `No channel found`, or nothing if `quiet` is `true`.',
        exampleCode: '{channelcategory;cool channel}\n{channelcategory;cool category}',
        exampleOut: '111111111111111\n(nothing is returned here)'
    })
    public getCategory(channel: GuildChannels): string {
        if (channel.parent === null)
            throw new BBTagRuntimeError('Channel has no parent').withDisplay('');

        return channel.parent.id;
    }
}
