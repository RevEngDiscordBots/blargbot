import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { GuildEmoji } from 'discord.js';

export class EmojiDeleteSubtag extends Subtag {
    public constructor() {
        super({
            name: 'emojidelete',
            category: SubtagType.GUILD
        });
    }

    @Subtag.signature('nothing', [ //TODO meaningful output like `true`/`false`,
        Subtag.context(),
        Subtag.argument('emoji', 'guildEmoji').catch()
    ], {
        description: 'Deletes an emoji with the provided `id`',
        exampleCode: '{emojidelete;11111111111111111}',
        exampleOut: ''
    })
    public async deleteEmoji(context: BBTagContext, emoji?: GuildEmoji): Promise<void> {
        const permission = context.permissions;

        if (!permission.has('MANAGE_EMOJIS_AND_STICKERS'))
            throw new BBTagRuntimeError('Author cannot delete emojis');

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            await emoji?.delete(fullReason);
        } catch (err: unknown) {
            if (err instanceof Error) {
                const parts = err.message.split('\n').map(m => m.trim());
                throw new BBTagRuntimeError('Failed to delete emoji: ' + (parts.length > 1 ? parts[1] : parts[0]));
            }
            throw err;
        }
    }
}
