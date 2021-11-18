import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class UserTimezoneSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usertimezone',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('user', 'user', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the set timezone code of the specified `user`. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.' +
            'If the user has no set timezone, the output will be UTC.',
        exampleCode: 'Discord official\'s timezone is {usertimezone;Discord official}',
        exampleOut: 'Discord official\'s timezone is Europe/Berlin'
    })
    public async getUserTimezone(context: BBTagContext, user: User): Promise<string> {
        const userTimezone = await context.database.users.getSetting(user.id, 'timezone');
        return userTimezone ?? 'UTC';
    }
}
