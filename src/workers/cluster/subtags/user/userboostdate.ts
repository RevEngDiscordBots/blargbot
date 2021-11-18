import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';
import moment from 'moment-timezone';

export class UserBoostDataSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userboostdate',
            category: SubtagType.USER,
            desc: 'See the [moment documentation](http://momentjs.com/docs/#/displaying/format/) for more information about formats. ' +
                'If user is not boosting the guild, returns `User not boosting`'
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('format', 'string').ifOmittedUse('YYYY-MM-DDTHH:mm:ssZ'),
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the date that `user` started boosting the current guild using `format` for the output, in UTC+0. ' +
            'If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: '{if;{isuserboosting;stupid cat};stupid cat is boosting!; no boosting here :(}',
        exampleOut: 'stupid cat is boosting!'
    })
    public getUserBoostDate(format: string, user: GuildMember): string {
        if (user.premiumSinceTimestamp === null)
            throw new BBTagRuntimeError('User not boosting');

        return moment(user.premiumSinceTimestamp).format(format);
    }
}
