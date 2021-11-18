import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class IsStaffSubtag extends Subtag {
    public constructor() {
        super({
            name: 'isstaff',
            aliases: ['ismod'],
            category: SubtagType.USER
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context()
    ], {
        description: 'Checks if the tag author is staff',
        exampleCode: '{if;{isstaff};The author is a staff member!;The author is not a staff member :(}',
        exampleOut: 'The author is a staff member!'
    })
    public async isExecutorStaff(context: BBTagContext): Promise<boolean> {
        return await context.isStaff;
    }

    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('user', 'member', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Checks if `user` is a member of staff. ' +
            'If the `user` cannot be found `false` will be returned.',
        exampleCode: '{if;{isstaff;{userid}};You are a staff member!;You are not a staff member :(}',
        exampleOut: 'You are not a staff member :('
    })
    public async isStaff(context: BBTagContext, user: GuildMember): Promise<boolean> {
        return await context.util.isUserStaff(user);
    }
}
