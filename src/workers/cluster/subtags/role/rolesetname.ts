import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, RoleNotFoundError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleSetNameSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolesetname',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('role', 'role'),
        Subtag.argument('name', 'string'),
        Subtag.quietArgument()
    ], {
        description: 'Sets the name of `role`.' +
            'If `quiet` is specified, if `role` can\'t be found it will simply return nothing',
        exampleCode: 'The admin role is now called administrator. {rolesetname;admin;administrator}',
        exampleOut: 'The admin role is now called administrator.'
    })
    public async setRolename(context: BBTagContext, role: Role, name: string, quiet: boolean): Promise<void> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot edit roles');

        if (role.position >= topRole)
            throw new BBTagRuntimeError('Role above author');

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await role.edit({ name }, fullReason);
        } catch (err: unknown) {
            if (!quiet)
                throw new BBTagRuntimeError('Failed to edit role: no perms');
            throw new RoleNotFoundError(role.id);
        }
    }
}
