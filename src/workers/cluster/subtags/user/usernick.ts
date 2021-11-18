import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class UserNickSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usernick',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `user`\'s username. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat\'s username is {username;Stupid cat}!',
        exampleOut: 'Stupid cat\'s username is Stupid cat!'
    })
    public getUserNick(user: GuildMember): string {
        return user.displayName.replace(/@/g, '@\u200b');
    }
}
