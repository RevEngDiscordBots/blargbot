import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { GuildMember, Role } from 'discord.js';

export class UserSetRolesSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usersetroles',
            aliases: ['setroles'],
            category: SubtagType.ROLE,
            desc: '`roleArray` must be an array formatted like `["role1", "role2"]`'
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('roles', 'role[]', { quietParseError: 'false', isVariableName: 'maybe' }),
        Subtag.argument('user', 'member', { quietParseError: 'false' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Sets the roles of `user` to `roleArray`. If quiet is provided, all errors will return `false`.',
        exampleCode: '{usersetroles;["1111111111111"];stupid cat}',
        exampleOut: 'true'
    })
    public async userSetRole(context: BBTagContext, roles: Role[], user: GuildMember): Promise<boolean> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot remove roles');

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await user.edit({ roles: roles }, fullReason);
            return true;
        } catch (err: unknown) {
            context.logger.error(err);
            return false;
        }

    }
}
