import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RolePermsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'roleperms',
            category: SubtagType.ROLE,
            aliases: ['rolepermissions']
        });
    }

    @Subtag.signature('bigint', [
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `role`\'s permission number. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
        exampleCode: 'The admin role\'s permissions are: {roleperms;admin}.',
        exampleOut: 'The admin role\'s permissions are: 8.'
    })
    public getRoleId(role: Role): bigint {
        return role.permissions.bitfield;
    }
}
