import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { CreateRoleOptions } from 'discord.js';

export class RoleCreateSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolecreate',
            category: SubtagType.ROLE,
            desc: '`color` can be a [HTML color](https://www.w3schools.com/colors/colors_names.asp), hex, (r,g,b) or a valid color number. ' +
                'Provide `permissions` as a number, which can be calculated [here](https://discordapi.com/permissions.html) ' +
                '`hoisted` is if the role should be displayed separately from other roles.\n' +
                'Returns the new role\'s ID.'
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('name', 'string'),
        Subtag.argument('color', 'color').ifOmittedUse(0),
        Subtag.argument('permissions', 'bigint', { parseError: 'Permissions not a number' }).ifOmittedUse(0n),
        Subtag.argument('mentionable', 'boolean').ifOmittedUse(false).catch(false),
        Subtag.argument('hoisted', 'boolean').ifOmittedUse(false).catch(false)
    ], {

    })
    public async createRole(context: BBTagContext, name: string, color: number, rolePerms: bigint, mentionable: boolean, hoisted: boolean): Promise<string> {
        const permission = context.permissions.valueOf();
        const topRole = discordUtil.getRoleEditPosition(context);

        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot create roles');

        const options: CreateRoleOptions = {
            name,
            reason: discordUtil.formatAuditReason(context.user, context.scopes.local.reason),
            color,
            permissions: rolePerms,
            mentionable,
            hoist: hoisted
        };

        if ((rolePerms & permission) !== rolePerms)
            throw new BBTagRuntimeError('Author missing requested permissions');

        try {
            const role = await context.guild.roles.create(options);
            if (context.guild.roles.cache.get(role.id) === undefined)
                context.guild.roles.cache.set(role.id, role);
            return role.id;
        } catch (err: unknown) {
            context.logger.error(err);
            throw new BBTagRuntimeError('Failed to create role: no perms');
        }
    }
}
