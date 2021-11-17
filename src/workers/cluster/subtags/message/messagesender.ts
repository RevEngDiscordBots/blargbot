import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class MessageSenderSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messagesender',
            category: SubtagType.MESSAGE,
            aliases: ['sender']
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id)
    ], {
        description: 'Returns the id of the author of the executing message.',
        exampleCode: 'That was sent by "{sender}"',
        exampleOut: 'That was sent by "1111111111111"'
    })
    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Returns the id of the author of `messageid` in the current channel.',
        exampleCode: 'Message 1111111111111 was sent by {sender;1111111111111}',
        exampleOut: 'Message 1111111111111 was sent by 2222222222222'
    })
    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the id of the author of `messageid` in `channel`. If `quiet` is provided and `channel` cannot be found, this will return nothing.',
        exampleCode: 'Message 1111111111111 in #support was sent by {sender;support;1111111111111}',
        exampleOut: 'Message 1111111111111 in #support was sent by 2222222222222'
    })
    public async getMessageSender(context: BBTagContext, channel: GuildChannels, messageStr: string): Promise<string> {
        const message = await context.util.getMessage(channel, messageStr);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageStr);
        return message.author.id;
    }
}
