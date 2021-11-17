import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { GuildMember, Role } from 'discord.js';

export class RoleAddSubtag extends Subtag {
    public constructor() {
        super({
            name: 'roleadd',
            category: SubtagType.ROLE,
            aliases: ['addrole'],
            desc: '`role` can be either a roleID or role mention.'
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('roles', 'role[]', { allowSingle: true, notEmpty: true }),
        Subtag.argument('user', 'member', { quietParseError: 'false' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Gives `user` the chosen `role`. Returns `true` if role was given, else an error will be shown. If `quiet` is specified, if a user can\'t be found it will simply return `false`',
        exampleCode: 'Stupid cat have a role! {roleadd;Bot;Stupid cat}',
        exampleOut: 'Stupid cat have a role! true'
    })
    public async addRole(context: BBTagContext, roles: Role[], user: GuildMember): Promise<boolean> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot add roles');

        if (roles.find(role => role.position >= topRole) !== undefined)
            throw new BBTagRuntimeError('Role above author');

        const roleIds = new Set(user.roles.cache.keys());
        roles.forEach(r => roleIds.add(r.id));

        if (roleIds.size === user.roles.cache.size)
            return false;

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await user.edit({ roles: [...roleIds] }, fullReason);
            return true;
        } catch (err: unknown) {
            context.logger.error(err);
            return false;
        }
    }
}
