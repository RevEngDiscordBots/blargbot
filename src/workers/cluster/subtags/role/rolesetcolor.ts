import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, parse, SubtagType } from '@cluster/utils';

export class RoleSetColorSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'rolesetcolor',
            category: SubtagType.ROLE,
            definition: [
                {
                    parameters: ['role'],
                    description: 'Sets the color of `role` to \'#000000\'. This is transparent.',
                    exampleCode: 'The admin role is now colourless. {rolesetcolor;admin}',
                    exampleOut: 'The admin role is now colourless.',
                    execute: (ctx, args) => this.setRolecolor(ctx, args[0].value, '', false)
                },
                {
                    parameters: ['role', 'color', 'quiet?'],
                    description: 'Sets the `color` of `role`.' +
                        'If `quiet` is specified, if `role` can\'t be found it will simply return nothing',
                    exampleCode: 'The admin role is now white. {rolesetcolor;admin;white}',
                    exampleOut: 'The admin role is now white.',
                    execute: (ctx, args) => this.setRolecolor(ctx, args[0].value, args[1].value, args[2].value !== '')
                }
            ]
        });
    }

    public async setRolecolor(
        context: BBTagContext,
        roleStr: string,
        colorStr: string,
        quiet: boolean
    ): Promise<string> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot edit roles');

        quiet ||= context.scopes.local.quiet ?? false;
        const role = await context.queryRole(roleStr, { noLookup: quiet });
        const color = parse.color(colorStr !== '' ? colorStr : 0);

        if (role !== undefined) {
            if (role.position >= topRole)
                throw new BBTagRuntimeError('Role above author');

            try {
                const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
                await role.edit({ color }, fullReason);
                return ''; //TODO meaningful output
            } catch (err: unknown) {
                if (!quiet)
                    throw new BBTagRuntimeError('Failed to edit role: no perms');
            }
        }
        throw new BBTagRuntimeError('Role not found'); //TODO this.noRoleFound instead
    }
}
