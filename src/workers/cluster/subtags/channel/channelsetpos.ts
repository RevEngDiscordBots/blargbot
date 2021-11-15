import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ChannelSetPosSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelsetpos',
            aliases: ['channelsetposition'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { customError: 'Channel does not exist' }),
        Subtag.argument('position', 'integer', { ifInvalid: NaN }) //TODO not a number error & bounds check
    ], {
        description: 'Moves a channel to the provided position.',
        exampleCode: '{channelsetpos;11111111111111111;5}',
        exampleOut: ''
    })
    public async setChannelPosition(context: BBTagContext, channel: GuildChannels, position: number): Promise<void> {
        const permission = channel.permissionsFor(context.authorizer);
        if (permission?.has('MANAGE_CHANNELS') !== true)
            throw new BBTagRuntimeError('Author cannot move this channel');

        try {
            await channel.edit({ position });
        } catch (err: unknown) {
            context.logger.error(err);
            throw new BBTagRuntimeError('Failed to move channel: no perms');
        }
    }
}
