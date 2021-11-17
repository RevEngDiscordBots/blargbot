import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ChannelDeleteSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channeldelete',
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { parseError: 'Channel does not exist' })
    ], {
        description: 'Deletes the provided `channel`.',
        exampleCode: '{channeldelete;11111111111111111}'
    })
    public async deleteChannel(context: BBTagContext, channel: GuildChannels): Promise<void> {
        const permission = channel.permissionsFor(context.authorizer);
        if (permission?.has('MANAGE_CHANNELS') !== true)
            throw new BBTagRuntimeError('Author cannot edit this channel');

        try {
            const fullReason = discordUtil.formatAuditReason(
                context.user,
                context.scopes.local.reason ?? ''
            );
            await channel.delete(fullReason);
        } catch (err: unknown) {
            context.logger.error(err);
            throw new BBTagRuntimeError('Failed to edit channel: no perms');
        }
    }
}
