import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { UserNotFoundError } from '@blargbot/cluster/bbtag/errors';
import { SubtagType } from '@blargbot/cluster/utils';

export class UserTimezoneSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'usertimezone',
            category: SubtagType.USER,
            definition: [
                {
                    parameters: [],
                    description: 'Returns the set timezone of the user executing the containing tag.',
                    exampleCode: '{usertimezone}',
                    exampleOut: 'UTC',
                    returns: 'string',
                    execute: ctx => this.getUserTimezone(ctx, '', false)
                },
                {
                    parameters: ['user', 'quiet?'],
                    description: 'Returns the set timezone code of the specified `user`. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.' +
                        'If the user has no set timezone, the output will be UTC.',
                    exampleCode: 'Discord official\'s timezone is {usertimezone;Discord official}',
                    exampleOut: 'Discord official\'s timezone is Europe/Berlin',
                    returns: 'string',
                    execute: (ctx, [userId, quiet]) => this.getUserTimezone(ctx, userId.value, quiet.value !== '')
                }
            ]
        });
    }

    public async getUserTimezone(
        context: BBTagContext,
        userStr: string,
        quiet: boolean
    ): Promise<string> {
        quiet ||= context.scopes.local.quiet ?? false;
        const user = await context.queryUser(userStr, { noLookup: quiet });

        if (user === undefined) {
            throw new UserNotFoundError(userStr)
                .withDisplay(quiet ? '' : undefined);
        }

        const userTimezone = await context.database.users.getSetting(user.id, 'timezone');
        return userTimezone ?? 'UTC';
    }
}
