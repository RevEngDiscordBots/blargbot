import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RolePosSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolepos',
            aliases: ['roleposition'],
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the position of `role`. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.\n**Note**: the highest role will have the highest position, and the lowest role will have the lowest position and therefore return `0` (`@everyone`).',
        exampleCode: 'The position of Mayor is {rolepos;Mayor}',
        exampleOut: 'The position of Mayor is 10'
    })
    public getRoleId(role: Role): number {
        return role.position;
    }
}
