import { BaseGuildCommand, commandTypes, FlagResult, GuildCommandContext, parse } from '../core';
import { humanize } from '../core/globalCore';

export class BanCommand extends BaseGuildCommand {
    public constructor() {
        super({
            name: 'ban',
            category: commandTypes.ADMIN,
            flags: [
                { flag: 'r', word: 'reason', desc: 'The reason for the ban.' },
                {
                    flag: 't',
                    word: 'time',
                    desc: 'If provided, the user will be unbanned after the period of time. (softban)'
                }
            ],
            definition: {
                parameters: '{user} [days:number]',
                description: 'Bans a user, where `days` is the number of days to delete messages for (defaults to 1).\n' +
                    'If mod-logging is enabled, the ban will be logged.',
                execute: (ctx, [user, days = 1], flags) => this.ban(ctx, user, days, flags)
            }
        });
    }

    public async ban(context: GuildCommandContext, userStr: string, days: number, flags: FlagResult): Promise<string> {
        const user = await context.util.getUser(context.message, userStr);
        if (user === undefined)
            return '❌ I couldn\'t find that user!';

        const reason = flags.r?.join(' ');
        const rawDuration = flags.t !== undefined ? parse.duration(flags.t.join(' ')) : undefined;
        const duration = rawDuration === undefined || rawDuration.asMilliseconds() <= 0 ? undefined : rawDuration;

        switch (await context.cluster.moderation.bans.ban(context.channel.guild, user, context.author, true, days, reason, duration)) {
            case 'alreadyBanned': return `❌ ${humanize.fullName(user)} is already banned!`;
            case 'memberTooHigh': return `❌ I don't have permission to ban ${humanize.fullName(user)}! Their highest role is above my highest role.`;
            case 'moderatorTooLow': return `❌ You don't have permission to ban ${humanize.fullName(user)}! Their highest role is above your highest role.`;
            case 'noPerms': return `❌ I don't have permission to ban ${humanize.fullName(user)}! Make sure I have the \`ban members\` permission and try again.`;
            case 'moderatorNoPerms': return `❌ You don't have permission to ban ${humanize.fullName(user)}! Make sure you have the \`ban members\` permission or one of the permissions specified in the \`ban override\` setting and try again.`;
            case 'success':
                if (flags.t === undefined)
                    return `✅ ${humanize.fullName(user)} has been banned.`;
                if (duration === undefined)
                    return `⚠️ ${humanize.fullName(user)} has been banned, but the duration was either 0 seconds or improperly formatted so they won't automatically be unbanned.`;
                return `✅ ${humanize.fullName(user)} has been banned and will be unbanned after ${humanize.duration(duration)}`;
        }
    }
}
