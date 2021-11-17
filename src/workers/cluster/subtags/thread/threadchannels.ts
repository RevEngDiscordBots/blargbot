import { Subtag } from '@cluster/bbtag';
import { InvalidChannelError } from '@cluster/bbtag/errors';
import { guard, SubtagType } from '@cluster/utils';
import { Guild, GuildChannels } from 'discord.js';

export class ThreadChannelsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'threadchannels',
            aliases: ['threads'],
            category: SubtagType.THREAD
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.context(ctx => ctx.guild)
    ], {
        description: 'Lists all active threads in the current server.',
        exampleCode: 'This guild has {length;{threads}} active threads!',
        exampleOut: 'This guild has 11 active threads!'
    })
    public async listGuildThreads(guild: Guild): Promise<string[]> {
        return (await guild.channels.fetchActiveThreads()).threads.map(t => t.id);
    }

    @Subtag.signature('snowflake[]', [
        Subtag.argument('channel', 'channel')
    ], {
        description: 'Lists all active threads in `channel`.',
        exampleCode: 'This channel has {length;{threads;{channelid}}} active threads!',
        exampleOut: 'This channel has 2 active threads!'
    })
    public async listChannelThreads(channel: GuildChannels): Promise<string[]> {
        if (!guard.isThreadableChannel(channel))
            throw new InvalidChannelError(channel);

        return (await channel.threads.fetchActive()).threads.map(t => t.id);

    }
}
