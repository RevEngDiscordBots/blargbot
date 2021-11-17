import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleColorSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolecolor',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `role`\'s hex color code. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
        exampleCode: 'The admin role color is: #{rolecolor;admin}.',
        exampleOut: 'The admin role ID is: #1b1b1b.'
    })
    public getRoleHexColor(role: Role): string {
        return role.color.toString(16).padStart(6, '0');
    }
}
