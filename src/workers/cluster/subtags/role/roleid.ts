import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'roleid',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `role`\'s ID. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
        exampleCode: 'The admin role ID is: {roleid;admin}.',
        exampleOut: 'The admin role ID is: 123456789123456.'
    })
    public getRoleId(role: Role): string {
        return role.id;
    }
}
