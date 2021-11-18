import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class UserGameSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usergame',
            category: SubtagType.USER,
            desc: 'If no game is being played, this will return \'nothing\''
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `user`\'s discriminator. If `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat\'s discriminator is {userdiscrim;Stupid cat}',
        exampleOut: 'Stupid cat\'s discriminator is 8160'
    })
    public getUserGame(user: GuildMember): string {
        return user.presence?.activities[0]?.name ?? 'nothing';
    }
}
