import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { BBTagRuntimeError, UserNotFoundError } from '@blargbot/cluster/bbtag/errors';
import { SubtagType } from '@blargbot/cluster/utils';

export class UserSetNickSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'usersetnick',
            category: SubtagType.USER,
            aliases: ['setnick'],
            definition: [
                {
                    parameters: ['nick', 'user?'],
                    description: 'Sets `user`\'s nickname to `nick`. Leave `nick` blank to reset their nickname.',
                    exampleCode: '{usersetnick;super cool nickname}\n{//;Reset the the nickname}\n{usersetnick;}',
                    exampleOut: '', //TODO meaningful output
                    returns: 'nothing',
                    execute: (ctx, [nick, user]) => this.setUserNick(ctx, nick.value, user.value)
                }
            ]
        });
    }

    public async setUserNick(context: BBTagContext, nick: string, userStr: string): Promise<void> {
        const member = await context.queryMember(userStr);

        if (member === undefined)
            throw new UserNotFoundError(userStr);

        try {
            await member.edit({ nick }, context.auditReason());
        } catch (err: unknown) {
            context.logger.error(err);
            if (err instanceof Error)
                throw new BBTagRuntimeError('Could not change nickname');
            throw err;
        }
    }
}