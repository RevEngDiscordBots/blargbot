import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class WarnSubtag extends Subtag {
    public constructor() {
        super({
            name: 'warn',
            category: SubtagType.USER,
            desc: '`user` defaults to the executing user.'
        });
    }

    @Subtag.signature('number', [
        Subtag.context(),
        Subtag.argument('user', 'member'),
        Subtag.argument('count', 'integer').ifOmittedUse(1),
        Subtag.argument('reason', 'string').allowOmitted()
    ], {
        description: 'Gives `user` `count` warnings.',
        exampleCode: 'Be warned Stupid cat! {warn;Stupid cat;9001;For being too cool}',
        exampleOut: 'Be warned Stupid cat! 9001'
    })
    public async warnUser(context: BBTagContext, user: GuildMember, count: number, reason?: string): Promise<number> {
        const result = await context.engine.cluster.moderation.warns.warn(user, context.discord.user, count, reason !== '' ? reason : 'Tag Warning');
        return result.warnings;
    }
}
