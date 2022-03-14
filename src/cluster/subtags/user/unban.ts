import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { BBTagRuntimeError, UserNotFoundError } from '@blargbot/cluster/bbtag/errors';
import { SubtagType } from '@blargbot/cluster/utils';

export class UnbanSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'unban',
            category: SubtagType.USER,
            definition: [
                {
                    parameters: ['user'],
                    description: 'Unbans `user`.',
                    exampleCode: '{unban;@user} @user was unbanned!',
                    exampleOut: '@user was unbanned!',
                    returns: 'boolean',
                    execute: (ctx, [user]) => this.unbanUser(ctx, user.value, '', '')
                },
                {
                    parameters: ['user', 'reason', 'noPerms?'],
                    description: 'Unbans `user` with the given `reason`.' +
                        'If `noPerms` is provided and not an empty string, do not check if the command executor is actually able to ban people. ' +
                        'Only provide this if you know what you\'re doing.',
                    exampleCode: '{unban;@stupid cat;I made a mistake} @stupid cat has been unbanned',
                    exampleOut: 'true @stupid cat has been unbanned',
                    returns: 'boolean',
                    execute: (ctx, [user, reason, noPerms]) => this.unbanUser(ctx, user.value, reason.value, noPerms.value)
                }
            ]
        });
    }

    public async unbanUser(
        context: BBTagContext,
        userStr: string,
        reason: string,
        nopermsStr: string
    ): Promise<boolean> {
        const user = await context.queryUser(userStr, { noErrors: context.scopes.local.noLookupErrors });
        const noPerms = nopermsStr !== '';

        if (user === undefined)
            throw new UserNotFoundError(userStr);

        if (reason === '')
            reason = 'Tag Unban';

        const result = await context.util.cluster.moderation.bans.unban(context.guild, user, context.user, !noPerms, reason);

        switch (result) {
            case 'success': return true;
            case 'moderatorNoPerms': throw new BBTagRuntimeError('User has no permissions');
            case 'noPerms': throw new BBTagRuntimeError('Bot has no permissions');
            case 'notBanned': return false;
        }
    }
}
