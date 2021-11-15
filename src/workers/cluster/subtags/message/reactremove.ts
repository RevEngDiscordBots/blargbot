import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { DiscordAPIError, EmojiIdentifierResolvable, GuildChannels, User } from 'discord.js';

export class ReactRemoveSubtag extends Subtag {
    public constructor() {
        super({
            name: 'reactremove',
            aliases: ['removereact'],
            category: SubtagType.MESSAGE
        });
    }

    public async removeAllReactions(context: BBTagContext, channel: GuildChannels, messageId: string): Promise<void> {
        const permissions = channel.permissionsFor(context.discord.user);
        if (permissions === null || !permissions.has('MANAGE_MESSAGES'))
            throw new BBTagRuntimeError('I need to be able to Manage Messages to remove reactions');

        const message = await context.util.getMessage(channel, messageId);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageId);

        if (!(await context.isStaff || context.ownsMessage(message.id)))
            throw new BBTagRuntimeError('Author must be staff to modify unrelated messages');

    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.context(ctx => ctx.user),
        Subtag.useValue(undefined)
    ], {
        description: 'Removes all reactions of the executing user from `messageId` in the current channel.',
        exampleCode: '{reactremove;12345678901234}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { noLookup: true }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.context(ctx => ctx.user),
        Subtag.useValue(undefined)
    ], {
        description: 'Removes all reactions of the executing user from `messageId` in `channel`.',
        exampleCode: '{reactremove;#support;12345678901234}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('user', 'user', { noLookup: true }),
        Subtag.useValue(undefined)
    ], {
        description: 'Removes all reactions made by `user` on `messageId` in the current channel.',
        exampleCode: '{reactremove;12345678901234;stupidcat}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { noLookup: true }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('user', 'user', { noLookup: true }),
        Subtag.useValue(undefined)
    ], {
        description: 'Removes all reactions made by `user` on `messageId` in `channel`.',
        exampleCode: '{reactremove;#support;12345678901234;stupidcat}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('user', 'user', { noLookup: true }),
        Subtag.argument('reactions', 'emoji', { repeat: [1, Infinity] })
    ], {
        description: 'Removes `reactions` made by `user` on `messageId` in the current channel.',
        exampleCode: '{reactremove;12345678901234;stupidcat;🤔;👀}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { noLookup: true }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('user', 'user', { noLookup: true }),
        Subtag.argument('reactions', 'emoji', { repeat: [1, Infinity] })
    ], {
        description: 'Removes `reactions` made by `user` on `messageId` in `channel`.',
        exampleCode: '{reactremove;#support;12345678901234;stupidcat;🤔;👀}'
    })
    public async removeUserReactions(context: BBTagContext, channel: GuildChannels, messageId: string, user: User, emojis?: EmojiIdentifierResolvable[]): Promise<void> {
        const permissions = channel.permissionsFor(context.discord.user);
        if (permissions === null || !permissions.has('MANAGE_MESSAGES'))
            throw new BBTagRuntimeError('I need to be able to Manage Messages to remove reactions');

        const message = await context.util.getMessage(channel, messageId);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageId);

        if (!(await context.isStaff || context.ownsMessage(message.id)))
            throw new BBTagRuntimeError('Author must be staff to modify unrelated messages');

        emojis ??= [...message.reactions.cache.keys()];
        for (const emoji of emojis) {
            const emojiStr = emoji.toString();
            try {
                await context.limit.check(context, 'reactremove:requests');
                await message.reactions.cache.get(emojiStr)?.users.remove(user);
            } catch (err: unknown) {
                if (err instanceof DiscordAPIError) {
                    switch (err.code) {
                        case 50013:
                            throw new BBTagRuntimeError('I need to be able to Manage Messages to remove reactions');
                        // TODO is this needed?
                        // case 10014:
                        //     errored.push(reaction);
                        //     break;
                        default:
                            throw err;
                    }
                }

            }
        }
    }
}
