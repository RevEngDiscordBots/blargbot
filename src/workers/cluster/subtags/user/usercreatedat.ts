import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';
import moment from 'moment-timezone';

export class UserCreateDatSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usercreatedat',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('format', 'string').ifOmittedUse('YYYY-MM-DDTHH:mm:ssZ'),
        Subtag.argument('user', 'user', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the account creation date of `user` in `format`. ' +
            'If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat\'s account was created on {usercreatedat;;Stupid cat}',
        exampleOut: 'Stupid cat\'s account was created on 2015-10-13T04:27:26Z'
    })
    public getUserCreatedAt(format: string, user: User): string {
        return moment(user.createdAt).utcOffset(0).format(format);
    }
}
