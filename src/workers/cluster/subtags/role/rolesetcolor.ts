import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleSetColorSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolesetcolor',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('role', 'role', { parseError: 'Role not found' }),
        Subtag.argument('color', 'color').ifOmittedUse(0),
        Subtag.quietArgument()
    ], {
        description: 'Sets the `color` of `role`.' +
            'If `quiet` is specified, if `role` can\'t be found it will simply return nothing',
        exampleCode: 'The admin role is now white. {rolesetcolor;admin;white}',
        exampleOut: 'The admin role is now white.'
    })
    public async setRolecolor(context: BBTagContext, role: Role, color: number, quiet: boolean): Promise<void> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot edit roles');

        if (role.position >= topRole)
            throw new BBTagRuntimeError('Role above author');

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await role.edit({ color }, fullReason);
        } catch (err: unknown) {
            if (!quiet)
                throw new BBTagRuntimeError('Failed to edit role: no perms');
        }
    }
}
