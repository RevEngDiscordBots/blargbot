import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ChannelNameSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelname',
            aliases: ['categoryname'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('string', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Returns the name of the current channel.',
        exampleCode: 'This channel\'s name is {channelname}',
        exampleOut: 'This channel\'s name is test-channel'
    })
    @Subtag.signature('string', [
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the name of the given `channel`. If it cannot be found returns `No channel found`, or nothing if `quiet` is `true`.',
        exampleCode: '{channelname;111111111111111}',
        exampleOut: 'cooler-test-channel'
    })
    public getChannelName(channel: GuildChannels): string {
        return channel.name;
    }
}
