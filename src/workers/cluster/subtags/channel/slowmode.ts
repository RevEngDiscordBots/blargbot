import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { humanize, SubtagType } from '@cluster/utils';
import { GuildChannels } from 'discord.js';

export class SlowmodeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'slowmode',
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.useValue(0)
    ], {
        description: 'Removes slowmode for the current channel.',
        exampleCode: '{slowmode}',
        exampleOut: '(slowmode is now disabled)'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('time', 'integer')
    ], {
        description: 'Enables slowmode in the current channel and sets the cooldown to `time`',
        exampleCode: '{slowmode;10}',
        exampleOut: '(set slowmode cooldown to 10 seconds)'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel'),
        Subtag.argument('time', 'integer').ifOmittedUse(0)
    ], {
        description: 'Enables slowmode in `channel` and set the cooldown to `time`.',
        exampleCode: '{slowmode;testing-grounds;10}',
        exampleOut: '(set slowmode cooldown to 10 seconds in testing-grounds)'
    })
    public async setSlowmode(context: BBTagContext, channel: GuildChannels, time: number): Promise<void> {
        time = Math.min(time, 21600);

        try {
            await channel.edit({
                rateLimitPerUser: time
            }, context.scopes.local.reason ?? 'Initiated from BBTag by ' + humanize.fullName(context.user));
        } catch (err: unknown) {
            throw new BBTagRuntimeError('Missing required permissions');
        }
    }
}
