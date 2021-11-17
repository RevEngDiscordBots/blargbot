import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleSetPermsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolesetperms',
            aliases: ['rolesetpermissions'],
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('role', 'role', { parseError: 'Role not found' }),
        Subtag.argument('permissions', 'bigint').ifOmittedUse(0n),
        Subtag.quietArgument()
    ], {
        description: 'Sets the permissions of `role` with the provided `permissions` number. ' +
            'This will not apply any permissions the authorizer can\'t grant. ' +
            'Additionally, this will completely overwrite the role\'s existing permissions. ' +
            'If `quiet` is specified, if `role` can\'t be found it will simply return nothing',
        exampleCode: 'The admin role now has the administrator permission. {rolesetperms;admin;8}',
        exampleOut: 'The admin role now has the administrator permission.'
    })
    public async roleSetPerms(context: BBTagContext, role: Role, permissions: bigint, quiet: boolean): Promise<void> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot edit roles');

        if (role.position >= topRole)
            throw new BBTagRuntimeError('Role above author');

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await role.edit({ permissions: permissions & context.permissions.bitfield }, fullReason);
        } catch (err: unknown) {
            if (!quiet)
                throw new BBTagRuntimeError('Failed to edit role: no perms');
            throw new BBTagRuntimeError('Role not found');
        }
    }
}
