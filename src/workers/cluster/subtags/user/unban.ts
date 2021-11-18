import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class UnbanSubtag extends Subtag {
    public constructor() {
        super({
            name: 'unban',
            category: SubtagType.USER
        });
    }
    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('user', 'user'),
        Subtag.argument('reason', 'string').allowOmitted(),
        Subtag.argument('noPerms', 'boolean', { mode: 'notEmpty' }).ifOmittedUse(false)
    ], {
        description: 'Unbans `user` with the given `reason`.' +
            'If `noPerms` is provided and not an empty string, do not check if the command executor is actually able to ban people. ' +
            'Only provide this if you know what you\'re doing.',
        exampleCode: '{unban;@stupid cat;I made a mistake} @stupid cat has been unbanned',
        exampleOut: 'true @stupid cat has been unbanned'
    })
    public async unbanUser(context: BBTagContext, user: User, reason: string | undefined, noPerms: boolean): Promise<boolean> {
        const result = await context.util.cluster.moderation.bans.unban(context.guild, user, context.user, noPerms, reason);

        switch (result) {
            case 'success': return true;
            case 'moderatorNoPerms': throw new BBTagRuntimeError('User has no permissions');
            case 'noPerms': throw new BBTagRuntimeError('Bot has no permissions');
            case 'notBanned': return false;
        }
    }
}
