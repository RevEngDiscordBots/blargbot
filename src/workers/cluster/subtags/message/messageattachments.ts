import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class MessageAttachmentsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messageattachments',
            aliases: ['attachments'],
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id)
    ], {
        description: 'Returns an array of attachments of the invoking message.',
        exampleCode: 'You sent the attachments "{messageattachments}"',
        exampleOut: 'You sent the attachments "["https://cdn.discordapp.com/attachments/1111111111111/111111111111111/thisisntreal.png"]"'
    })
    @Subtag.signature('snowflake[]', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Returns an array of attachments of `messageid` in the current channel',
        exampleCode: 'Someone sent a message with attachments: "{messageattachments;1111111111111}"',
        exampleOut: 'Someone sent a message with attachments: "["https://cdn.discordapp.com/attachments/1111111111111/111111111111111/thisisntreal.png"]"'
    })
    @Subtag.signature('snowflake[]', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { quietErrorDisplay: '[]' }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns an array of attachments of `messageid` from `channel`. If `quiet` is provided and `channel` cannot be found, this will return an empty array.',
        exampleCode: 'Someone sent a message in #support with attachments: "{messageattachments;support;1111111111111}"',
        exampleOut: 'Someone sent a message in #support with attachments: "["https://cdn.discordapp.com/attachments/1111111111111/111111111111111/thisisntreal.png"]"'
    })
    public async getMessageAttachments(context: BBTagContext, channel: GuildChannels, messageStr: string): Promise<string[]> {
        const message = await context.util.getMessage(channel, messageStr);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageStr);
        return message.attachments.map(a => a.id);
    }
}
