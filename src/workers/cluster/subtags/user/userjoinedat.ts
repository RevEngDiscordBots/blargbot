import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';
import moment from 'moment';

export class UserJoinedAtSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userjoinedat',
            category: SubtagType.USER,
            desc: 'For a list of formats see the [moment documentation](http://momentjs.com/docs/#/displaying/format/) for more information.'
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('format', 'string').ifOmittedUse('YYYY-MM-DDTHH:mm:ssZ'),
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the date that `user` joined the current guild using `format` for the output, in UTC+0. if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat joined this guild on {userjoinedat;YYYY/MM/DD HH:mm:ss;Stupid cat}',
        exampleOut: 'Stupid cat joined this guild on 2016/06/19 23:30:30'
    })
    public getUserJoinDate(format: string, user: GuildMember): string {
        return moment(user.joinedAt).utcOffset(0).format(format);
    }
}
