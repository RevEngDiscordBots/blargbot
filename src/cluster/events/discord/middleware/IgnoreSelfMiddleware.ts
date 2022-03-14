import { guard } from '@blargbot/cluster/utils';
import { Logger } from '@blargbot/core/Logger';
import { metrics } from '@blargbot/core/Metrics';
import { IMiddleware, NextMiddleware } from '@blargbot/core/types';
import { Client as Discord, KnownMessage } from 'eris';

export class IgnoreSelfMiddleware implements IMiddleware<KnownMessage, boolean> {
    readonly #discord: Discord;

    public constructor(private readonly logger: Logger, discord: Discord) {
        this.#discord = discord;
    }

    public async execute(context: KnownMessage, next: NextMiddleware<boolean>): Promise<boolean> {
        if (context.author.id !== this.#discord.user.id) {
            metrics.messageCounter.inc();
            return await next();
        }

        const channel = context.channel;
        if (guard.isGuildChannel(channel)) {
            const guild = channel.guild;
            this.logger.output(`${guild.name} (${guild.id})> ${channel.name} (${channel.id})> ${context.author.username}> ${context.content} (${context.id})`);
        } else if (guard.isPrivateChannel(channel)) {
            const recipient = channel.recipient;
            this.logger.output(`PM> ${recipient.username} (${recipient.id})> (${channel.id})> ${context.author.username}> ${context.content} (${context.id})`);
        }

        return false;
    }
}
