import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, RoleNotFoundError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleSetPosSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolesetpos',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('role', 'role', { parseError: 'Role not found' }),
        Subtag.argument('position', 'integer'),
        Subtag.quietArgument()
    ], {
        description: 'Sets the position of `role`. ' +
            'If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
        exampleCode: 'The admin role is now at position 3. {rolesetpos;admin;3}',
        exampleOut: 'The admin role is now at position 3.'
    })
    public async setRolePosition(context: BBTagContext, role: Role, position: number, quiet: boolean): Promise<boolean> {
        const topRole = discordUtil.getRoleEditPosition(context);
        if (topRole === 0)
            throw new BBTagRuntimeError('Author cannot edit roles');

        if (role.position >= topRole)
            throw new BBTagRuntimeError('Role above author');
        if (position >= topRole)
            throw new BBTagRuntimeError('Desired position above author');

        try {
            await role.edit({ position });
            return true;
        } catch (err: unknown) {
            if (!quiet)
                throw new BBTagRuntimeError('Failed to edit role: no perms');
            throw new RoleNotFoundError(role.id);
        }
    }
}
