import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class UserIsBotSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userisbot',
            aliases: ['userbot'],
            category: SubtagType.USER
        });
    }

    @Subtag.signature('boolean', [
        Subtag.argument('user', 'user', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns whether a `user` is a bot. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Is Stupid cat a bot? {userisbot;Stupid cat}',
        exampleOut: 'Stupid cat\'s username is Stupid cat!'
    })
    public getUserIsBot(user: User): boolean {
        return user.bot;
    }
}
