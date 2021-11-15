import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';
import moment from 'moment';

export class MessageEditTimeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messageedittime',
            category: SubtagType.MESSAGE,
            desc: 'If the message is not edited, this will return the current time instead.\n\n**Note:** there are plans to change this behaviour, but due to backwards-compatibility this remains unchanged.'
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id),
        Subtag.argument('format', 'string', { ifOmitted: 'x' })
    ], {
        description: 'Returns the edit time of the executing message in the given `format`',
        exampleCode: 'The edit timestamp of your message is "{messageedittime;DD/MM/YYYY}"',
        exampleOut: 'The edit timestamp of your message is "12/08/2021"'
    })
    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('format', 'string', { ifOmitted: 'x' })
    ], {
        description: 'Returns the edit time of the `message` from the current channel in the given `format`',
        exampleCode: 'The edit timestamp of message 11111111111111 is "{messageedittime;11111111111111;DD/MM/YYYY}"',
        exampleOut: 'The edit timestamp of message 11111111111111 is "12/08/2021"'
    })
    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('format', 'string', { ifOmitted: 'x' })
    ], {
        description: 'Returns the edit time of the `message` from in `channel` in the given `format`',
        exampleCode: 'The edit timestamp of message 11111111111111 in #support is "{messageedittime;support;11111111111111;DD/MM/YYYY}"',
        exampleOut: 'The edit timestamp of message 11111111111111 in #support is "12/08/2021"'
    })
    public async getMessageEditTime(context: BBTagContext, channel: GuildChannels, messageStr: string, format: string): Promise<string> {
        const message = await context.util.getMessage(channel.id, messageStr);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageStr);

        //TODO Dont return the current time
        return message.editedTimestamp === null
            ? moment().format('x')
            : moment(message.editedTimestamp).format(format);

    }
}
