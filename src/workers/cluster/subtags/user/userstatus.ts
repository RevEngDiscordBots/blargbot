import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class UserStatusSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userstatus',
            category: SubtagType.USER,
            desc: 'Returned status can be one of `online`, `idle`, `dnd` or `offline`'
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the status of `user`. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat is currently {userstatus;stupid cat}',
        exampleOut: 'Stupid cat is currently online'
    })
    public getUserStatus(user: GuildMember): string {
        return user.presence?.status ?? 'offline';
    }
}
