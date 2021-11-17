import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels } from 'discord.js';

export class ChannelPosSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelpos',
            aliases: ['categorypos'],
            category: SubtagType.CHANNEL,
            desc: 'The position is the index per channel type (text, voice or category) in the channel list.'
        });
    }

    @Subtag.signature('number', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Returns the position of the current channel.',
        exampleCode: 'This channel is in position {channelpos}',
        exampleOut: 'This channel is in position 1'
    })
    @Subtag.signature('number', [
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the position of the given `channel`. If it cannot be found returns `No channel found`, or nothing if `quiet` is `true`.',
        exampleCode: 'The position of test-channel is {channelpos;test-channel}',
        exampleOut: 'The position of test-channel is 0'
    })
    public getChannelPosition(channel: GuildChannels): number {
        if (guard.isThreadChannel(channel))
            throw new BBTagRuntimeError('Threads dont have a position', `${channel.toString()} is a thread and doesnt have a position`);

        return channel.position;
    }
}
