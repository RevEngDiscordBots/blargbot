import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleNameSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolename',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `role`\'s name. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
        exampleCode: 'The admin role name is: {rolename;admin}.',
        exampleOut: 'The admin role name is: Adminstrator.'
    })
    public getRoleId(role: Role): string {
        return role.name;
    }
}
