import { BaseGuildCommand } from '@cluster/command';
import { GuildCommandContext } from '@cluster/types';
import { bbtagUtil, codeBlock, CommandType, guard } from '@cluster/utils';
import { humanize } from '@core/utils';
import { MessageOptions } from 'discord.js';

export class IntervalCommand extends BaseGuildCommand {
    public constructor() {
        super({
            name: 'interval',
            category: CommandType.ADMIN,
            definitions: [
                {
                    parameters: 'set {~code+}',
                    description: 'Sets the code to run every 15 minutes',
                    execute: (ctx, [code]) => this.setInterval(ctx, code)
                },
                {
                    parameters: 'raw',
                    description: 'Gets the current code that the interval is running',
                    execute: (ctx) => this.getRaw(ctx)
                },
                {
                    parameters: 'delete',
                    description: 'Deletes the current interval',
                    execute: (ctx) => this.deleteInterval(ctx)
                },
                {
                    parameters: 'setauthorizer',
                    description: 'Sets the interval to run using your permissions',
                    execute: (ctx) => this.setAuthorizer(ctx)
                },
                {
                    parameters: 'debug',
                    description: 'Runs the interval now and sends the debug output',
                    execute: (ctx) => this.debug(ctx)
                }
            ]
        });
    }

    public async setInterval(context: GuildCommandContext, code: string): Promise<string> {
        const interval = await context.database.guilds.getInterval(context.channel.guild.id) ?? {};
        await context.database.guilds.setInterval(context.channel.guild.id, { ...interval, content: code, author: context.author.id });
        return this.success('The interval has been set');
    }

    public async deleteInterval(context: GuildCommandContext): Promise<string> {
        const interval = await context.database.guilds.getInterval(context.channel.guild.id);
        if (interval === undefined)
            return this.error('There is no interval currently set up!');

        await context.database.guilds.setInterval(context.channel.guild.id, undefined);
        return this.success('The interval has been deleted');
    }

    public async getRaw(context: GuildCommandContext): Promise<string | MessageOptions> {
        const interval = await context.database.guilds.getInterval(context.channel.guild.id);
        if (interval === undefined)
            return this.error('There is no interval currently set up!');

        const response = this.success(`The raw code for the interval is:\n${codeBlock(interval.content)}`);
        return guard.checkMessageSize(response)
            ? response
            : {
                content: this.success('The raw code for the interval is attached'),
                files: [
                    {
                        name: 'interval.bbtag',
                        attachment: interval.content
                    }
                ]
            };
    }

    public async setAuthorizer(context: GuildCommandContext): Promise<string> {
        const interval = await context.database.guilds.getInterval(context.channel.guild.id);
        if (interval === undefined)
            return this.error('There is no interval currently set up!');

        await context.database.guilds.setInterval(context.channel.guild.id, { ...interval, authorizer: context.author.id });
        return this.success('Your permissions will now be used when the interval runs');
    }

    public async debug(context: GuildCommandContext): Promise<string | MessageOptions> {
        const interval = await context.database.guilds.getInterval(context.channel.guild.id);
        if (interval === undefined)
            return this.error('There is no interval currently set up!');

        const result = await context.cluster.intervals.invoke(context.channel.guild, interval);
        switch (result) {
            case 'FAILED': return this.error('There was an error while running the interval!');
            case 'MISSING_AUTHORIZER': return this.error('I couldnt find the user who authorizes the interval!');
            case 'MISSING_CHANNEL': return this.error('I wasnt able to figure out which channel to run the interval in!');
            case 'TOO_LONG': return this.error(`The interval took longer than the max allowed time (${humanize.duration(context.cluster.intervals.timeLimit)})`);
        }

        return bbtagUtil.createDebugOutput('interval', interval.content, '', result);
    }
}