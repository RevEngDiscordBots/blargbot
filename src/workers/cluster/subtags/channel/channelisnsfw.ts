import { Subtag } from '@cluster/bbtag';
import { guard, SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ChannelIsNsfw extends Subtag {
    public constructor() {
        super({
            name: 'channelisnsfw',
            category: SubtagType.CHANNEL,
            aliases: ['isnsfw']
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Checks if the current channel is a NSFW channel.',
        exampleCode: '{if;{isnsfw};Spooky nsfw stuff;fluffy bunnies}',
        exampleOut: 'fluffy bunnies'
    })
    @Subtag.signature('boolean', [
        Subtag.argument('channel', 'channel', { quietErrorDisplay: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Checks if `channel` is a NSFW channel. If it cannot be found returns `No channel found`, or `false` if `quiet` is `true`.',
        exampleCode: '{isnsfw;SFW Cat pics}',
        exampleOut: 'true'
    })
    public isNsfwChannel(channel: GuildChannels): boolean {
        return !guard.isThreadChannel(channel) && guard.isTextableChannel(channel) && channel.nsfw;
    }
}
