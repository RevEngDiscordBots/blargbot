import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels } from 'discord.js';

export class LastMessageIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'lastmessageid',
            category: SubtagType.CHANNEL,
            desc: 'Returns nothing if the channel doesn\'t have any messages.'
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Returns the messageID of the last message in the current channel.',
        exampleCode: '{lastmessageid}',
        exampleOut: '1111111111111111'
    })
    @Subtag.signature('snowflake', [
        Subtag.argument('channel', 'channel')
    ], {
        description: 'Returns the messageID of the last message in `channel`.',
        exampleCode: '{lastmessageid;1111111111111111}',
        exampleOut: '2222222222222222'
    })
    public getLastMessageID(channel: GuildChannels): string {
        if (!guard.isTextableChannel(channel))
            throw new BBTagRuntimeError('Channel must be a textable channel');

        return channel.lastMessageId ?? '';
    }
}
