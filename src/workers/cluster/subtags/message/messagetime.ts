import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';
import moment from 'moment';

export class MessageTimeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messagetime',
            aliases: ['timestamp'],
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id),
        Subtag.argument('format', 'string', { ifOmitted: 'x' })
    ], {
        description: 'Returns the send time of the executing message in the given `format`',
        exampleCode: 'The send timestamp of your message is "{messagetime;DD/MM/YYYY}"',
        exampleOut: 'The send timestamp of your message is "12/08/2021"'
    })
    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('format', 'string', { ifOmitted: 'x' })
    ], {
        description: 'Returns the send time of the `message` from the current channel in the given `format`',
        exampleCode: 'The send timestamp of message 11111111111111 is "{messagetime;11111111111111;DD/MM/YYYY}"',
        exampleOut: 'The send timestamp of message 11111111111111 is "12/08/2021"'
    })
    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('format', 'string', { ifOmitted: 'x' })
    ], {
        description: 'Returns the send time of the `message` from in `channel` in the given `format`',
        exampleCode: 'The send timestamp of message 11111111111111 in #support is "{messagetime;support;11111111111111;DD/MM/YYYY}"',
        exampleOut: 'The send timestamp of message 11111111111111 in #support is "12/08/2021"'
    })
    public async getMessageTime(context: BBTagContext, channel: GuildChannels, messageStr: string, format: string): Promise<string> {
        const message = await context.util.getMessage(channel.id, messageStr);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageStr);

        return moment(message.createdTimestamp).format(format);
    }
}
