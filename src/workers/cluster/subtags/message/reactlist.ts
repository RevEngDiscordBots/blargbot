import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { EmojiIdentifierResolvable, GuildChannels } from 'discord.js';

export class ReactListSubtag extends Subtag {
    public constructor() {
        super({
            name: 'reactlist',
            aliases: ['listreact'],
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('error', [Subtag.context()], { hidden: true })
    public rememberKidsIfYouWriteBuggyCodeItCanLastALifetime(context: BBTagContext): never {
        throw new MessageNotFoundError(context.channel, '');
    }

    @Subtag.signature('string[]', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Returns an array of reactions on `messageId` in the current channel.',
        exampleCode: '{reactlist;111111111111111111}',
        exampleOut: '["🤔", "👀"]'
    })
    @Subtag.signature('string[]', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { noLookup: true }),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Returns an array of reactions on `messageId` in `channel`.',
        exampleCode: '{reactlist;222222222222222222;111111111111111111}',
        exampleOut: '["🤔", "👀"]'
    })
    public async getReactions(context: BBTagContext, channel: GuildChannels, messageId: string): Promise<string[]> {
        const message = await context.util.getMessage(channel, messageId);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageId);

        return message.reactions.cache.map(r => r.emoji.toString());
    }

    @Subtag.signature('string[]', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('reactions', 'emoji').repeat(1, Infinity)
    ], {
        description: 'Returns an array of users who reacted `reactions` on `messageId` in the current channel. A user only needs to react to one reaction to be included in the resulting array.',
        exampleCode: '{reactlist;111111111111111111;🤔;👀}',
        exampleOut: '["278237925009784832", "134133271750639616"]'
    })
    @Subtag.signature('string[]', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { noLookup: true }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('reactions', 'emoji').repeat(1, Infinity)
    ], {
        description: 'Returns an array of users who reacted `reactions` on `messageId` in `channel`. A user only needs to react to one reaction to be included in the resulting array.',
        exampleCode: '{reactlist;222222222222222222;111111111111111111;🤔;👀}',
        exampleOut: '["278237925009784832", "134133271750639616"]'
    })
    public async getReactors(context: BBTagContext, channel: GuildChannels, messageId: string, emojis: EmojiIdentifierResolvable[]): Promise<string[]> {
        const message = await context.util.getMessage(channel, messageId);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageId);

        const result = new Set<string>();
        for (const emoji of emojis) {
            const emojiStr = emoji.toString();
            const reaction = message.reactions.cache.get(emojiStr) ?? message.reactions.cache.get(emojiStr.replace(/^a?:/i, ''));
            if (reaction === undefined)
                continue;

            //TODO: Try/catch needed?
            const users = await reaction.users.fetch();
            for (const user of users.keys())
                result.add(user);
        }
        return [...result];
    }
}
