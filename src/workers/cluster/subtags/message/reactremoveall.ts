import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class ReactRemoveAllSubtag extends Subtag {
    public constructor() {
        super({
            name: 'reactremoveall',
            aliases: ['removereactall'],
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { noLookup: true }),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Removes all reactions from `messageId` in `channel`.',
        exampleCode: '{reactremoveall;#support;11111111111111}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Removes all reactions from `messageId` in the current channel.',
        exampleCode: '{reactremoveall;11111111111111}'
    })
    public async removeAllReactions(context: BBTagContext, channel: GuildChannels, messageId: string): Promise<void> {
        const message = await context.util.getMessage(channel, messageId);

        if (message === undefined)
            throw new MessageNotFoundError(channel, messageId);

        if (!(await context.isStaff || context.ownsMessage(message.id)))
            throw new BBTagRuntimeError('Author must be staff to modify unrelated messages');

        await message.reactions.removeAll();
        //TODO meaningful output please
    }
}
