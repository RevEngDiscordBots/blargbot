import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class UserRolesSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userroles',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `user`\'s roles as an array. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat\'s roles are {userroles;stupidcat}',
        exampleOut: 'Stupid cat\'s roles are ["1111111111111111","2222222222222222", "3333333333333333"]'
    })
    public getUserRoles(user: GuildMember): Iterable<string> {
        return user.roles.cache.keys();
    }
}
