import { BBTagContext, ParseResult, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels, MessageEmbedOptions } from 'discord.js';

export class EditSubtag extends Subtag {
    public constructor() {
        super({
            name: 'edit',
            category: SubtagType.MESSAGE,
            desc: '`content` and `embed` can both be set to `_delete` to remove either the message content or embed.' +
                'Please note that `embed` is the JSON for an embed object or an array of embed objects, don\'t put `{embed}` there, as nothing will show. Only messages created by the bot may be edited.'
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.useValue(undefined),
        Subtag.argument('embeds', 'embed[]', { ifInvalid: shouldDeleteEmbeds })
    ], {
        description: 'Edits a `message` that I sent in the current channel to have the `embeds` given.',
        exampleCode: '{edit;111111111111111111;{embedbuild;title:Hello world}}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('content', 'string'),
        Subtag.useValue(undefined)
    ], {
        description: 'Edits a `message` that I sent in the current channel to have the `content` given.',
        exampleCode: '{edit;111111111111111111;Hello world}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.useValue(undefined),
        Subtag.argument('embeds', 'embed[]', { ifInvalid: shouldDeleteEmbeds })
    ], {
        description: 'Edits a `message` that I sent in the `channel` to have the `embeds` given.',
        exampleCode: '{edit;111111111111111111;222222222222222222;{embedbuild;title:Hello world}}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('content', 'string'),
        Subtag.useValue(undefined)
    ], {
        description: 'Edits a `message` that I sent in the `channel` to have the `content` given.',
        exampleCode: '{edit;111111111111111111;222222222222222222;Hello world}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('content', 'string'),
        Subtag.argument('embeds', 'embed[]', { allowMalformed: true, ifInvalid: shouldDeleteEmbeds })
    ], {
        description: 'Edits a `message` that I sent in the `channel` to have the `content` and `embeds` given.',
        exampleCode: '{edit;111111111111111111;222222222222222222;Hello world;{embedbuild;title:Foo bar}}'
    })
    public async edit(context: BBTagContext, channel: GuildChannels, messageId: string, content?: string, embeds?: MessageEmbedOptions[]): Promise<void> {
        const message = await context.util.getMessage(channel.id, messageId);

        if (message === undefined)
            throw new MessageNotFoundError(channel, messageId);

        if (message.author.id !== context.discord.user.id)
            throw new BBTagRuntimeError('I must be the message author');

        content = content ?? message.content;
        if (content === '_delete') content = '';

        const actualEmbeds = embeds ?? message.embeds;
        if (content.trim() === '' && actualEmbeds.length === 0)
            throw new BBTagRuntimeError('Message cannot be empty');
        try {
            await message.edit({ content, embeds: actualEmbeds });
        } catch (err: unknown) {
            // NOOP
        }
    }
}

function shouldDeleteEmbeds(value: string): ParseResult<[]> {
    if (value === '_delete')
        return { success: true, value: [] };
    return { success: false };
}
