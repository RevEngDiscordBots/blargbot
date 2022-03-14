import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { BBTagRuntimeError, ChannelNotFoundError, MessageNotFoundError } from '@blargbot/cluster/bbtag/errors';
import { guard, SubtagType } from '@blargbot/cluster/utils';

export class DeleteSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'delete',
            desc: 'Only ccommands can delete other messages.',
            category: SubtagType.MESSAGE,
            definition: [
                {
                    parameters: [],
                    description: 'Deletes the message that invoked the command',
                    exampleIn: '{//;The message that triggered this will be deleted} {delete}',
                    exampleOut: '(the message got deleted idk how to do examples for this)',
                    returns: 'nothing',
                    execute: (ctx) => this.deleteMessage(ctx, ctx.channel.id, ctx.message.id)
                },
                {
                    parameters: ['messageId'],
                    description: 'Deletes the specified `messageId` from the current channel.',
                    exampleIn: '{//;The message with ID `111111111111111111` will be deleted}\n{delete;111111111111111111}',
                    exampleOut: '(the message `111111111111111111` got deleted idk how to do examples for this)',
                    returns: 'nothing',
                    execute: (ctx, [messageId]) => this.deleteMessage(ctx, ctx.channel.id, messageId.value)
                },
                {
                    parameters: ['channel', 'messageId'],
                    description: 'Deletes the specified `messageId` from channel `channel`.',
                    exampleIn: '{//;The message with ID `2222222222222222` from channel `1111111111111111` will be deleted}\n{delete;111111111111111111;2222222222222222}',
                    exampleOut: '(the message `2222222222222222` from channel `1111111111111111` got deleted)',
                    returns: 'nothing',
                    execute: (ctx, [channel, messageId]) => this.deleteMessage(ctx, channel.value, messageId.value)
                }
            ]
        });
    }

    public async deleteMessage(
        context: BBTagContext,
        channelStr: string,
        messageId: string
    ): Promise<void> {
        if (!(await context.isStaff || context.ownsMessage(messageId)))
            throw new BBTagRuntimeError('Author must be staff to delete unrelated messages');

        const channel = await context.queryChannel(channelStr);
        if (channel === undefined)
            throw new ChannelNotFoundError(channelStr);

        if (messageId.length === 0 || !guard.isTextableChannel(channel))
            throw new MessageNotFoundError(channel.id, messageId).withDisplay('');

        const msg = await context.util.getMessage(channel, messageId);
        if (msg === undefined)
            throw new MessageNotFoundError(channel.id, messageId).withDisplay('');

        context.engine.cluster.commands.messages.remove(context.guild.id, msg.id);
        try {
            await msg.delete();
        } catch (e: unknown) {
            context.logger.warn('Failed to delete message', e);
            // NOOP
        }
        //TODO return something like true/false
    }
}