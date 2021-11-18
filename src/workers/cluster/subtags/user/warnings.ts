import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class WarningsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'warnings',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('number', [
        Subtag.context(),
        Subtag.argument('user', 'user').ifOmittedUse('{userid}')
    ], {
        description: 'Gets the number of warnings `user` has. `user` defaults to the user who executed the containing tag.',
        exampleCode: 'You have {warnings} warning(s)!',
        exampleOut: 'You have 0 warning(s)!'
    })
    public async getUserWarnings(context: BBTagContext, user: User): Promise<number> {
        return await context.database.guilds.getWarnings(context.guild.id, user.id) ?? 0;
    }
}
