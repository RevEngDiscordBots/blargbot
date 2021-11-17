import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class MessageTextSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messagetext',
            aliases: ['text'],
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id)
    ], {
        description: 'Returns the text of the executing message.',
        exampleCode: 'You sent "text"',
        exampleOut: 'You sent "b!t test You sent "{text}""`'
    })
    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Returns the text of `messageid` in the current channel.',
        exampleCode: 'Message 1111111111111 contained: "{text;1111111111111}"',
        exampleOut: 'Message 1111111111111 contained: "Hello world!"'
    })
    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the text of `messageid` in `channel`. If `quiet` is provided and `channel` cannot be found, this will return nothing.',
        exampleCode: 'Message 1111111111111 in #support contained: "{text;support;1111111111111}"',
        exampleOut: 'Message 1111111111111 in #support contained: "Spooky Stuff"'
    })
    public async getMessageText(context: BBTagContext, channel: GuildChannels, messageStr: string): Promise<string> {
        const message = await context.util.getMessage(channel, messageStr);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageStr);
        return message.content;
    }
}
