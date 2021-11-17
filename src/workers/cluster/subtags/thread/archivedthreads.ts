import { Subtag } from '@cluster/bbtag';
import { InvalidChannelError } from '@cluster/bbtag/errors';
import { guard, SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ArchivedThreadsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'archivedthreads',
            category: SubtagType.THREAD
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.argument('channel', 'channel').ifOmittedUse('{channelid}')
    ], {
        description: 'Lists all archived threads in `channel`.\nReturns an array of thread channel IDs.',
        exampleCode: '{archivedthreads;123456789123456}',
        exampleOut: '["123456789012345", "98765432198765"]'
    })
    public async getArchivedThreads(channel: GuildChannels): Promise<string[]> {
        if (!guard.isThreadableChannel(channel))
            throw new InvalidChannelError(channel);

        return (await channel.threads.fetchArchived()).threads.map(t => t.id);
    }
}
