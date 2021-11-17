import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';

export class RoleMentionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolemention',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('role', 'role', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns a mention of `role`. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
        exampleCode: 'The admin role will be mentioned: {rolemention;Admin}',
        exampleOut: 'The admin role will be mentioned: @\u200BAdminstrator'
    })
    public roleMention(context: BBTagContext, role: Role): string {
        if (!context.state.allowedMentions.roles.includes(role.id))
            context.state.allowedMentions.roles.push(role.id);
        return role.toString();
    }
}
