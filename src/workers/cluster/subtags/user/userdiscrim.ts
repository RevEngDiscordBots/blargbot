import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class UserDiscrimSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userdiscrim',
            category: SubtagType.USER,
            desc: 'If no game is being played, this will return \'nothing\''
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('user', 'user', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `user`\'s discriminator. If `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat\'s discriminator is {userdiscrim;Stupid cat}',
        exampleOut: 'Stupid cat\'s discriminator is 8160'
    })
    public getUserDiscrim(user: User): string {
        return user.discriminator;
    }
}
