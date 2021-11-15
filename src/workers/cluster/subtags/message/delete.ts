import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, MessageNotFoundError } from '@cluster/bbtag/errors';
import { guard, SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class DeleteSubtag extends Subtag {
    public constructor() {
        super({
            name: 'delete',
            desc: 'Only ccommands can delete other messages.',
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id)
    ], {
        description: 'Deletes the message that invoked the command',
        exampleIn: '{//;The message that triggered this will be deleted} {delete}',
        exampleOut: '(the message got deleted idk how to do examples for this)'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Deletes the specified `messageId` from the current channel.',
        exampleIn: '{//;The message with ID `111111111111111111` will be deleted}\n{delete;111111111111111111}',
        exampleOut: '(the message `111111111111111111` got deleted idk how to do examples for this)'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Deletes the specified `messageId` from channel `channel`.',
        exampleIn: '{//;The message with ID `2222222222222222` from channel `1111111111111111` will be deleted}\n{delete;111111111111111111;2222222222222222}',
        exampleOut: '(the message `2222222222222222` from channel `1111111111111111` got deleted)'
    })
    public async deleteMessage(context: BBTagContext, channel: GuildChannels, messageId: string): Promise<void> {
        if (!(await context.isStaff || context.ownsMessage(messageId)))
            throw new BBTagRuntimeError('Author must be staff to delete unrelated messages');

        if (messageId.length === 0 || !guard.isTextableChannel(channel))
            throw new MessageNotFoundError(channel, messageId);

        const msg = await context.util.getMessage(channel.id, messageId);
        if (msg === undefined)
            throw new MessageNotFoundError(channel, messageId);

        context.engine.cluster.commands.messages.remove(context.guild.id, msg.id);
        try {
            await msg.delete();
        } catch (e: unknown) {
            // NOOP
        }
        //TODO return something like true/false
    }
}
