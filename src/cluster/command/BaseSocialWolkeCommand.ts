import { CommandType } from '@blargbot/cluster/utils';
import { EmbedOptions, User } from 'eris';
import Wolke from 'wolken';

import { BaseGlobalCommand } from './BaseGlobalCommand';
import { CommandContext } from './CommandContext';

export interface SocialWolkeOptions {
    search: string;
    action?: string;
    user?: boolean;
    description: string;
    wolkeKey: string;
}

export abstract class BaseSocialWolkeCommand extends BaseGlobalCommand {
    private readonly client: Wolke;

    public constructor(
        name: string,
        options: SocialWolkeOptions
    ) {
        super({
            name: name,
            category: CommandType.SOCIAL,
            definitions: [
                options.user !== true ? {
                    parameters: '',
                    description: options.description,
                    execute: (ctx) => this.render(ctx, options.search, options.action, undefined)
                } : {
                    parameters: '{user:user+?}',
                    description: options.description,
                    execute: (ctx, [user]) => this.render(ctx, options.search, options.action, user.asOptionalUser ?? ctx.author)
                }
            ]
        });

        this.client = new Wolke(options.wolkeKey, 'Wolke', 'blargbot/6.0.0');
    }

    public async render(context: CommandContext, type: string, action: string | undefined, target: User | undefined): Promise<EmbedOptions> {
        const image = await this.client.getRandom({ type, allowNSFW: false, filetype: 'gif' });
        const message = action !== undefined ? target === undefined
            ? `**<@${context.author.id}>** ${action}!`
            : `**<@${context.author.id}>** ${action} **${target.id === context.author.id ? 'themself' : target.mention}**!`
            : undefined;

        return {
            description: message,
            image: { url: image.url },
            footer: { text: 'Powered by weeb.sh' }
        };
    }
}