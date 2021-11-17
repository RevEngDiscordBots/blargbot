import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleMembersSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolemembers',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns an array of members in `role`. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
        exampleCode: 'The admins are: {rolemembers;Admin}.',
        exampleOut: 'The admins are: ["11111111111111111","22222222222222222"].'
    })
    public async getRoleMembers(role: Role): Promise<string[]> {
        role = await role.guild.roles.fetch(role.id) ?? role;
        return role.members.map(m => m.user.id);
    }
}
