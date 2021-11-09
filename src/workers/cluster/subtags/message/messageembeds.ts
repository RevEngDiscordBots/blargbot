import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { ChannelNotFoundError, MessageNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { Message } from 'discord.js';

export class MessageEmbedsSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'messageembeds',
            category: SubtagType.MESSAGE,
            definition: [
                {
                    parameters: [],
                    description: 'Returns an array of embeds of the invoking message.',
                    exampleCode: 'You sent an embed: "{messageembeds}"',
                    exampleOut: 'You sent an embed: "[{"title":"Hello!"}]"',
                    execute: (ctx) => this.getMessageEmbeds(ctx, ctx.channel.id, ctx.message.id, false)
                },
                {
                    parameters: ['messageid'],
                    description: 'Returns an array of embeds of `messageid` in the current channel',
                    exampleCode: 'Someone sent a message with embeds: "{messageembeds;1111111111111}"',
                    exampleOut: 'Someone sent a message with attachments: "[{"title":"Hello!"}]"',
                    execute: (ctx, args) => this.getMessageEmbeds(ctx, ctx.channel.id, args[0].value, false)
                },
                {
                    parameters: ['channel', 'messageid', 'quiet?'],
                    description: 'Returns an array of embeds of `messageid` from `channel`. If `quiet` is provided and `channel` cannot be found, this will return an empty array.',
                    exampleCode: 'Someone sent a message in #support with embeds: "{messageembeds;support;1111111111111}"',
                    exampleOut: 'Someone sent a message in #support with embeds: "[{"title":"Hello!"}]"',
                    execute: (ctx, args) => this.getMessageEmbeds(ctx, args[0].value, args[1].value, args[2].value !== '')
                }
            ]
        });
    }

    public async getMessageEmbeds(
        context: BBTagContext,
        channelStr: string,
        messageStr: string,
        quiet: boolean
    ): Promise<string> {
        quiet ||= context.scopes.local.quiet ?? false;
        const channel = await context.queryChannel(channelStr, { noLookup: quiet });
        if (channel === undefined) {
            if (quiet)
                return '[]';
            throw new ChannelNotFoundError(channelStr);
        }

        let message: Message | undefined;
        try {
            message = await context.util.getMessage(channel, messageStr);
            if (message === undefined)
                throw new MessageNotFoundError(channel, messageStr);
            return JSON.stringify(message.embeds);
        } catch (e: unknown) {
            throw new MessageNotFoundError(channel, messageStr);
        }

    }
}
