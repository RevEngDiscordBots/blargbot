import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { User } from 'discord.js';

export class ModlogSubtag extends Subtag {
    public constructor() {
        super({
            name: 'modlog',
            category: SubtagType.BOT,
            desc: 'If `moderator` is not provided or left empty, it will default to blargbot.'
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('action', 'string'),
        Subtag.argument('user', 'user'),
        Subtag.argument('moderator', 'user').catch().allowOmitted(),
        Subtag.argument('reason', 'string').allowOmitted(),
        Subtag.argument('color', 'color').catch().allowOmitted()
    ], {
        description: 'Creates a custom modlog entry with the given `action` and `user` with `reason`. ' +
            '`color` can be a [HTML color](https://www.w3schools.com/colors/colors_names.asp), hex, (r,g,b) or a valid color number. .',
        exampleCode: 'You did a bad! {modlog;Bad;{userid};;They did a bad;#ffffff}',
        exampleOut: 'You did a bad! (modlog entry with white embed colour and reason \'They did a bad!\''
    })
    public async createModlog(context: BBTagContext, action: string, user: User, mod: User | undefined, reason: string | undefined, color: number | undefined): Promise<void> {
        await context.util.cluster.moderation.modLog.logCustom(context.guild, action, user, mod ?? context.discord.user, reason, color);
    }
}
