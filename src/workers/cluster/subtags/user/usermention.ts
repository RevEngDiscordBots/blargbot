import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class UserMentionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usermention',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('user', 'user', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Mentions `user`. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Hello, {usermention;Stupidcat}!',
        exampleOut: 'Hello, @Stupid cat!'
    })
    public userMention(context: BBTagContext, user: User): string {
        if (!context.state.allowedMentions.users.includes(user.id))
            context.state.allowedMentions.users.push(user.id);
        return user.toString();
    }
}
