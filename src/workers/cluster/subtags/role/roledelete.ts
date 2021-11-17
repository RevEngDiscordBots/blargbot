import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleDeleteSubtag extends Subtag {
    public constructor() {
        super({
            name: 'roledelete',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Deletes `role`. If `quiet` is specified, if `role` can\'t be found it will return nothing.\nWarning: this subtag is able to delete roles managed by integrations.',
        exampleCode: '{roledelete;Super Cool Role!}',
        exampleOut: '(rip no more super cool roles for anyone)'
    })
    public async deleteRole(context: BBTagContext, role: Role): Promise<void> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot delete roles');

        if (role.position >= topRole)
            throw new BBTagRuntimeError('Role above author');

        try {
            const reason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await role.delete(reason);
        } catch (err: unknown) {
            context.logger.error(err);
            throw new BBTagRuntimeError('Failed to delete role: no perms');
        }
    }
}
