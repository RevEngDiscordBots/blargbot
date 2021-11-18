import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class UserSetNickSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usersetnick',
            aliases: ['setnick'],
            category: SubtagType.USER
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('nickname', 'string'),
        Subtag.argument('user', 'member').ifOmittedUse('{userid}')
    ], {
        description: 'Sets `user`\'s nickname to `nick`. Leave `nick` blank to reset their nickname.',
        exampleCode: '{usersetnick;super cool nickname}\n{//;Reset the the nickname}\n{usersetnick;}',
        exampleOut: '' //TODO meaningful output
    })
    public async setUserNick(context: BBTagContext, nick: string, user: GuildMember): Promise<void> {
        try {
            if (user.id === context.discord.user.id)
                await user.setNickname(nick);
            else {
                const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
                await user.setNickname(nick, fullReason);
            }
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new BBTagRuntimeError('Could not change nickname');
            throw err;
        }
    }
}
