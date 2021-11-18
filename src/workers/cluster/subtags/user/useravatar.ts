import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class UserAvatarSubtag extends Subtag {
    public constructor() {
        super({
            name: 'useravatar',
            category: SubtagType.USER,
            desc: 'If no game is being played, this will return \'nothing\''
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the avatar of `user`. If `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat\'s avatar is {useravatar;Stupid cat}',
        exampleOut: 'Stupid cat\'s avatar is (avatar url)'
    })
    public getUserAvatarUrl(user: GuildMember): string {
        return user.displayAvatarURL({ dynamic: true, format: 'png', size: 512 });
    }
}
