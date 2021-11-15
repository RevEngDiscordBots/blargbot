import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels, GuildMember, Permissions, Role, User } from 'discord.js';

export class ChannelSetPermsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelsetperms',
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { customError: 'Channel does not exist' }),
        Subtag.argument('type', 'string', { guard: v => v === 'role', customError: 'Type must be member or role' }).noEmit(), //TODO Make this be type restricted to 'role'
        Subtag.argument('role', 'role')
    ], {
        description: 'Deletes the permission overwrites of `role` in `channel`.\n' +
            'Returns the channel\'s ID.',
        exampleCode: '{channelsetperms;11111111111111111;role;My role}',
        exampleOut: '11111111111111111'
    })
    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { customError: 'Channel does not exist' }),
        Subtag.argument('type', 'string', { guard: v => v === 'member', customError: 'Type must be member or role' }).noEmit(), //TODO Make this be type restricted to 'member'
        Subtag.argument('user', 'user')
    ], {
        description: 'Deletes the permission overwrites of `user` in `channel`.\n' +
            'Returns the channel\'s ID.',
        exampleCode: '{channelsetperms;11111111111111111;member;Some user}',
        exampleOut: '11111111111111111'
    })
    public async channelDeleteOverwrite(context: BBTagContext, channel: GuildChannels, target: User | GuildMember | Role): Promise<string> {
        if (guard.isThreadChannel(channel))
            throw new BBTagRuntimeError('Cannot set permissions for a thread channel');

        const permission = channel.permissionsFor(context.authorizer);
        if (permission?.has('MANAGE_CHANNELS') !== true)
            throw new BBTagRuntimeError('Author cannot edit this channel');

        try {
            const override = channel.permissionOverwrites.cache.get(target.id);
            if (override !== undefined)
                await override.delete();
            return channel.id;
        } catch (e: unknown) {
            throw new BBTagRuntimeError('Failed to edit channel: no perms');
        }
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { customError: 'Channel does not exist' }),
        Subtag.argument('type', 'string', { guard: v => v === 'role', customError: 'Type must be member or role' }).noEmit(), //TODO Make this be type restricted to 'role'
        Subtag.argument('role', 'role'),
        Subtag.argument('allow', 'bigint'),
        Subtag.argument('deny', 'bigint', { ifOmitted: 0n })
    ], {
        description: 'Sets the permissions of a `role` in `channel`\n' +
            '`type` is must be `role`\n' +
            'Provide `allow` and `deny` as numbers, which can be calculated [here](https://discordapi.com/permissions.html). ' +
            'Returns the channel\'s ID.',
        exampleCode: '{channelsetperms;11111111111111111;role;My role;1024;2048}',
        exampleOut: '11111111111111111'
    })
    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { customError: 'Channel does not exist' }),
        Subtag.argument('type', 'string', { guard: v => v === 'member', customError: 'Type must be member or role' }).noEmit(), //TODO Make this be type restricted to 'member'
        Subtag.argument('user', 'user'),
        Subtag.argument('allow', 'bigint', { ifOmitted: 0n }),
        Subtag.argument('deny', 'bigint', { ifOmitted: 0n })
    ], {
        description: 'Sets the permissions of a `user` in `channel`\n' +
            '`type` is must be `member`\n' +
            'Provide `allow` and `deny` as numbers, which can be calculated [here](https://discordapi.com/permissions.html). ' +
            'Returns the channel\'s ID.',
        exampleCode: '{channelsetperms;11111111111111111;member;Some user;1024;2048}',
        exampleOut: '11111111111111111'
    })
    public async channelSetPerms(context: BBTagContext, channel: GuildChannels, entity: Role | GuildMember | User, allow: bigint, deny: bigint): Promise<string> {
        if (guard.isThreadChannel(channel))
            throw new BBTagRuntimeError('Cannot set permissions for a thread channel');

        const permission = channel.permissionsFor(context.authorizer);
        if (permission?.has('MANAGE_CHANNELS') !== true)
            throw new BBTagRuntimeError('Author cannot edit this channel');

        try {
            const fullReason = discordUtil.formatAuditReason(
                context.user,
                context.scopes.local.reason ?? ''
            );
            const allowed = new Permissions(allow).toArray();
            const denied = new Permissions(deny).toArray();
            const options = Object.fromEntries([
                ...Object.keys(Permissions.FLAGS).map(k => [k, null] as const),
                ...allowed.map(str => [str, true] as const),
                ...denied.map(str => [str, false] as const)
            ]);
            const overwrite = channel.permissionOverwrites.cache.get(entity.id);
            if (overwrite !== undefined) {
                if (allow === 0n && deny === 0n) {
                    await overwrite.edit({}); //* Feel like this shouldn't be here but backwards compatibility
                } else {
                    await overwrite.edit(options, fullReason);
                }
            } else if (allow !== 0n || deny !== 0n) {
                await channel.permissionOverwrites.create(entity, options, { reason: fullReason });
            }
            return channel.id;
        } catch (err: unknown) {
            context.logger.error(err);
            throw new BBTagRuntimeError('Failed to edit channel: no perms');
        }
    }
}
