import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class PardonSubtag extends Subtag {
    public constructor() {
        super({
            name: 'pardon',
            category: SubtagType.USER,
            desc: '`user` defaults to the executing user. Returns the new warning count'
        });
    }

    @Subtag.signature('number', [
        Subtag.context(),
        Subtag.argument('user', 'member', { noLookup: true }).ifOmittedUse('{userid}'),
        Subtag.argument('count', 'integer').ifOmittedUse(1),
        Subtag.argument('reason', 'string').allowOmitted()
    ], {
        description: 'Gives `user` `count` pardons with `reason`.',
        exampleCode: 'Be pardoned 9001 times, Stupid cat! {pardon;Stupid cat;9001}',
        exampleOut: 'Be pardoned 9001 times, Stupid cat! 0'
    })
    public async pardon(context: BBTagContext, user: GuildMember, count: number, reason?: string): Promise<number> {
        const result = await context.engine.cluster.moderation.warns.pardon(user, context.discord.user, count, reason === '' ? 'Tag Pardon' : reason);
        return result.warnings;
    }
}
