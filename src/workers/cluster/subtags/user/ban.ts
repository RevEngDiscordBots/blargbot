import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';
import { Duration } from 'moment';

export class BanSubtag extends Subtag {
    public constructor() {
        super({
            name: 'ban',
            category: SubtagType.USER,
            desc: '`daysToDelete` is the number of days to delete messages for. `duration`'
        });
    }

    public async banMember(context: BBTagContext, user: User, daysToDelete: number, reason: string, unbanAfter: Duration, noPerms: boolean): Promise<number>;
    public async banMember(context: BBTagContext, user: User, daysToDelete: number, reason: string, unbanAfter: undefined, noPerms: boolean): Promise<boolean>;
    public async banMember(context: BBTagContext, user: User, daysToDelete: number, reason: string, unbanAfter: Duration | undefined, noPerms: boolean): Promise<boolean | number>;
    @Subtag.signature('number', [
        Subtag.context(),
        Subtag.argument('user', 'user'),
        Subtag.argument('daysToDelete', 'number', { quietParseError: 'false' }).ifOmittedUse(1),
        Subtag.argument('reason', 'string'),
        Subtag.argument('unbanAfter', 'duration'),
        Subtag.argument('noPerms', 'boolean', { mode: 'notEmpty' })
    ], {
        description: 'Bans `user` for duration `timeToUnban` with `reason`. If `noPerms` is provided and not empty, do not check if the command executor is actually able to ban people.' +
            'Only provide this if you know what you\'re doing.',
        exampleCode: '{ban;Stupid cat;;For being stupid;5 days;anythingcangohere}',
        exampleOut: '432000000 (anyone can use this cc regardless of perms)'
    })
    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('user', 'user'),
        Subtag.argument('daysToDelete', 'number', { quietParseError: 'false' }).ifOmittedUse(1),
        Subtag.argument('reason', 'string'),
        Subtag.argument('unbanAfter', 'string').convert(() => undefined),
        Subtag.argument('noPerms', 'boolean', { mode: 'notEmpty' })
    ], {
        description: 'Bans `user` with `reason`. If `noPerms` is provided and not empty, do not check if the command executor is actually able to ban people.' +
            'Only provide this if you know what you\'re doing.',
        exampleCode: '{ban;Stupid cat;;For being stupid;;}',
        exampleOut: 'true (only staff can use this command)'
    })
    public async banMember(context: BBTagContext, user: User, daysToDelete: number, reason: string, duration: Duration | undefined, noPerms: boolean): Promise<boolean | number> {
        const response = await context.engine.cluster.moderation.bans.ban(context.guild, user, context.discord.user, noPerms, daysToDelete, reason, duration);
        switch (response) {
            case 'alreadyBanned':
            case 'success':
                return duration?.asMilliseconds() ?? true;
            default:
                throw new BBTagRuntimeError(errorMap[response]);
        }

    }
}

const errorMap = {
    'noPerms': 'Bot has no permissions',
    'memberTooHigh': 'Bot has no permissions',
    'moderatorNoPerms': 'User has no permissions',
    'moderatorTooLow': 'User has no permissions'
    //'alreadyBanned': 'User has already been banned' //TODO JS blarg returns true for this
};
