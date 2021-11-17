import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleSizeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolesize',
            aliases: ['inrole'],
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('role', 'role')
        // Subtag.quietArgument().noEmit() // TODO: enable the quiet parameter?
    ], {
        description: 'Returns the amount of people in role `role`',
        exampleCode: 'There are {rolesize;11111111111111111} people in the role!',
        exampleOut: 'There are 5 people in the role!'
    })
    public getRoleSize(role: Role): number {
        return role.members.size;
    }
}
