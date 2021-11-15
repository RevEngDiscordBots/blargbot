import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { Constants, GuildChannels } from 'discord.js';

export class MessageTypeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messagetype',
            category: SubtagType.MESSAGE,
            desc: 'For more info about message types, visit the [discord docs]().'
        });
    }

    public async getCurrentMessageType(
        context: BBTagContext
    ): Promise<number> {
        const msg = await context.util.getMessage(context.channel, context.message.id);
        if (msg === undefined)
            throw new MessageNotFoundError(context.channel, context.message.id);
        return Constants.MessageTypes.indexOf(msg.type);
    }

    @Subtag.signature('number', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id)
    ], {
        description: 'Returns the message type of the executing message.',
        exampleCode: '{messagetype}',
        exampleOut: '0'
    })
    @Subtag.signature('number', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Returns the message type of `messageID` in the current channel',
        exampleCode: '{messagetype;1234567891234}',
        exampleOut: '5'
    })
    @Subtag.signature('number', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns the message type of `messageID` in `channel`',
        exampleCode: '{messagetype;12345678912345;123465145791}',
        exampleOut: '19'
    })
    public async getMessageType(context: BBTagContext, channel: GuildChannels, messageStr: string): Promise<number> {
        const message = await context.util.getMessage(channel, messageStr);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageStr);
        return Constants.MessageTypes.indexOf(message.type);
    }
}
