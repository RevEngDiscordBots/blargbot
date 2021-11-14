import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, mapping, SubtagType } from '@cluster/utils';
import { TypeMapping } from '@core/types';
import { guard } from '@core/utils';
import { ChannelData, GuildChannels, ThreadEditData } from 'discord.js';

export class ChannelEditSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channeledit',
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { customError: 'Channel does not exist' }),
        Subtag.argument('options', 'string', { ifOmitted: '{}' }) // TODO integrate mapping framework somehow?
    ], {
        description: 'Edits a channel with the given information.\n' +
            '`options` is a JSON object, containing any or all of the following properties:\n' +
            '- `name`\n' +
            '- `topic`\n' +
            '- `nsfw`\n' +
            '- `parentID`\n' +
            '- `reason` (displayed in audit log)\n' +
            '- `rateLimitPerUser`\n' +
            '- `bitrate` (voice)\n' +
            '- `userLimit` (voice)\n' +
            'Returns the channel\'s ID.',
        exampleCode: '{channeledit;11111111111111111;{j;{"name": "super-cool-channel"}}}',
        exampleOut: '11111111111111111'
    })
    public async channelEdit(context: BBTagContext, channel: GuildChannels, options: string): Promise<string> {
        const permission = channel.permissionsFor(context.authorizer);
        if (permission?.has('MANAGE_CHANNELS') !== true)
            throw new BBTagRuntimeError('Author cannot edit this channel');

        return guard.isThreadChannel(channel)
            ? await this.channelEditCore(context, channel, options, mapThreadOptions)
            : await this.channelEditCore(context, channel, options, mapChannelOptions);
    }

    private async channelEditCore<T>(
        context: BBTagContext,
        channel: Extract<GuildChannels, { edit(data: T, fullReason?: string): Promise<unknown>; }>,
        editJson: string,
        mapping: TypeMapping<T>
    ): Promise<string> {
        const options = mapping(editJson);
        if (!options.valid)
            throw new BBTagRuntimeError('Invalid JSON');

        try {
            const fullReason = discordUtil.formatAuditReason(
                context.user,
                context.scopes.local.reason ?? ''
            );
            await channel.edit(options.value, fullReason);
            return channel.id;
        } catch (err: unknown) {
            context.logger.error(err);
            throw new BBTagRuntimeError('Failed to edit channel: no perms');
        }
    }
}

const mapChannelOptions = mapping.json(
    mapping.object<ChannelData>({
        bitrate: mapping.number.optional,
        name: mapping.string.optional,
        nsfw: mapping.boolean.optional,
        parent: ['parentID', mapping.string.optional],
        rateLimitPerUser: mapping.number.optional,
        topic: mapping.string.optional,
        userLimit: mapping.number.optional,
        defaultAutoArchiveDuration: mapping.in(60, 1440, 4320, 10080, undefined),
        lockPermissions: mapping.boolean.optional,
        permissionOverwrites: [undefined],
        position: mapping.number.optional,
        rtcRegion: [undefined],
        type: [undefined]
    })
);

const mapThreadOptions = mapping.json(
    mapping.object<ThreadEditData>({
        archived: mapping.boolean.optional,
        autoArchiveDuration: mapping.in(60, 1440, 4320, 10080, undefined),
        locked: mapping.boolean.optional,
        name: mapping.string.optional,
        rateLimitPerUser: mapping.number,
        invitable: mapping.boolean.optional
    })
);
