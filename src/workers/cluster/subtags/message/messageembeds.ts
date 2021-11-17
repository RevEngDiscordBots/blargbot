import { BBTagContext, Subtag } from '@cluster/bbtag';
import { MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class MessageEmbedsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messageembeds',
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('json[]', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.context(ctx => ctx.message.id)
    ], {
        description: 'Returns an array of embeds of the invoking message.',
        exampleCode: 'You sent an embed: "{messageembeds}"',
        exampleOut: 'You sent an embed: "[{"title":"Hello!"}]"'
    })
    @Subtag.signature('json[]', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake')
    ], {
        description: 'Returns an array of embeds of `messageid` in the current channel',
        exampleCode: 'Someone sent a message with embeds: "{messageembeds;1111111111111}"',
        exampleOut: 'Someone sent a message with attachments: "[{"title":"Hello!"}]"'
    })
    @Subtag.signature('json[]', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { quietParseError: '[]' }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns an array of embeds of `messageid` from `channel`. If `quiet` is provided and `channel` cannot be found, this will return an empty array.',
        exampleCode: 'Someone sent a message in #support with embeds: "{messageembeds;support;1111111111111}"',
        exampleOut: 'Someone sent a message in #support with embeds: "[{"title":"Hello!"}]"'
    })
    public async getMessageEmbeds(context: BBTagContext, channel: GuildChannels, messageStr: string): Promise<JObject[]> {
        const message = await context.util.getMessage(channel, messageStr);
        if (message === undefined)
            throw new MessageNotFoundError(channel, messageStr);
        return message.embeds.map(e => e.toJSON() as JObject);

    }
}
