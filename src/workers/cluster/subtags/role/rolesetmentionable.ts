import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleSetMentionableSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolesetmentionable',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('role', 'role', { parseError: 'Role not found' }),
        Subtag.argument('mentionable', 'boolean').ifOmittedUse(true).catch(false),
        Subtag.quietArgument()
    ], {
        description: 'Sets whether `role` can be mentioned. `value` can be either `true` to set the role as mentionable, ' +
            'or anything else to set it to unmentionable. ' +
            'If `quiet` is specified, if `role` can\'t be found it will simply return nothing',
        exampleCode: 'The admin role is no longer mentionable. {rolesetmentionable;admin;false}',
        exampleOut: 'The admin role is no longer mentionable.'
    })
    public async setRolementionable(context: BBTagContext, role: Role, mentionable: boolean, quiet: boolean): Promise<void> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot edit roles');

        if (role.position >= topRole)
            throw new BBTagRuntimeError('Role above author');

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await role.edit({ mentionable }, fullReason);
        } catch (err: unknown) {
            if (!quiet)
                throw new BBTagRuntimeError('Failed to edit role: no perms');
        }
    }
}
