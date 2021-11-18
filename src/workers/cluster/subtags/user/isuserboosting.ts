import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class IsUserBoostingSubtag extends Subtag {
    public constructor() {
        super({
            name: 'isuserboosting',
            category: SubtagType.USER
        });
    }
    @Subtag.signature('boolean', [
        Subtag.context(ctx => ctx.member)
    ], {
        description: 'Returns `true` if the executing user is boosting the guild and `false` if not.',
        exampleCode: '{if;{isuserboosting};Yes you are boosting;You should consider boosting}',
        exampleOut: 'You should consider boosting'
    })
    @Subtag.signature('boolean', [
        Subtag.argument('user', 'member', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `true` if the `user` is boosting the guild and `false` if not. ' +
            'If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: '{if;{isuserboosting;stupid cat};stupid cat is boosting!; no boosting here :(}',
        exampleOut: 'stupid cat is boosting!'
    })
    public isUserBoosting(member: GuildMember): boolean {
        return member.premiumSinceTimestamp !== null;
    }
}
