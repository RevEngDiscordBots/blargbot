import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class UserIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userid',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.argument('user', 'user', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `user`\'s ID. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'This is Stupid cat\'s user ID {userid;Stupid cat}',
        exampleOut: 'This is Stupid cat\'s user ID 103347843934212096'
    })
    public getUserId(user: User): string {
        return user.id;
    }
}
