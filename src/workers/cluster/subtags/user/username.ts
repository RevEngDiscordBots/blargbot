import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class UserNameSubtag extends Subtag {
    public constructor() {
        super({
            name: 'username',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('user', 'user', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `user`\'s username. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat\'s username is {username;Stupid cat}!',
        exampleOut: 'Stupid cat\'s username is Stupid cat!'
    })
    public getUserName(user: User): string {
        return user.username.replace(/@/g, '@\u200b');
    }
}
