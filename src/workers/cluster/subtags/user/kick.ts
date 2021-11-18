import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class KickSubtag extends Subtag {
    public constructor() {
        super({
            name: 'kick',
            category: SubtagType.USER,
            desc: 'If the kick is successful, `Success` will be returned, otherwise the error will be given. '
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('user', 'member', { noLookup: true }),
        Subtag.argument('reason', 'string').allowOmitted(),
        Subtag.argument('noPerms', 'boolean', { mode: 'notEmpty' }).ifOmittedUse(false)
    ], {
        description: 'Kicks `user`. ' +
            'If `noPerms` is provided and not an empty string, do not check if the command executor is actually able to kick people. ' +
            'Only provide this if you know what you\'re doing.',
        exampleCode: '{kick;stupid cat;because I can} @stupid cat was kicked!',
        exampleOut: 'Success @stupid cat was kicked, because I can!'
    })
    public async kickMember(context: BBTagContext, user: GuildMember, reason: string | undefined, noperms: boolean): Promise<string> {
        const response = await context.util.cluster.moderation.bans.kick(user, context.user, noperms, reason);

        switch (response) {
            case 'success': //Successful
                return 'Success'; //TODO true/false response
            case 'noPerms': //Bot doesnt have perms
                throw new BBTagRuntimeError('I don\'t have permission to kick users!');
            case 'memberTooHigh': //Bot cannot kick target
                throw new BBTagRuntimeError(`I don't have permission to kick ${user.user.username}!`);
            case 'moderatorNoPerms': //User doesnt have perms
                throw new BBTagRuntimeError('You don\'t have permission to kick users!');
            case 'moderatorTooLow': //User cannot kick target
                throw new BBTagRuntimeError(`You don't have permission to kick ${user.user.username}!`);
        }
    }
}
