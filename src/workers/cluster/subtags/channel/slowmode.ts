import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { SubtagCall } from '@cluster/types';
import { humanize, parse, SubtagType } from '@cluster/utils';

export class SlowmodeSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'slowmode',
            category: SubtagType.API,
            definition: [
                {
                    parameters: [],
                    description: 'Removes slowmode for the current channel.',
                    exampleCode: '{slowmode}',
                    exampleOut: '(slowmode is now disabled)',
                    execute: (context, _, subtag): string | void => {
                        try {
                            void context.channel.edit({
                                rateLimitPerUser: 0
                            }, context.scope.reason ?? 'Initiated from BBTag by ' + humanize.fullName(context.user));
                        } catch (err: unknown) {
                            return this.customError('Missing required permissions', context, subtag);
                        }
                    }
                },
                {
                    parameters: ['channel|time'],
                    description: 'Removes slowmode from `channel`. If `channel` cannot be resolved directly, it will enable slowmode for the current channel and set the cooldown to `time`',
                    exampleCode: '{slowmode;testing-grounds}\n{slowmode;10}',
                    exampleOut: '(disabled slowmode in testing-grounds)\n(set slow mode to 10 seconds)',
                    execute: (ctx, args, subtag) => this.setSlowmode(ctx, args[0].value, '', subtag)
                },
                {
                    parameters: ['channel', 'time:0'],
                    description: 'Enables slowmode in `channel` and set the cooldown to `time`. If `channel` cannot be resolved directly, it will remove slowmode in the current channel (unless `channel` is a valid number, then the slowmode cooldown will be set to `channel` in the current channel).', //TODO thank backwards compatibility
                    exampleCode: '{slowmode;testing-grounds;10}\n{slowmode;50;doesn\'t matter}',
                    exampleOut: '(set slowmode cooldown to 10 seconds in testing-grounds)\n(set slowmode to 50s in the current channel)',
                    execute: (ctx, args, subtag) => this.setSlowmode(ctx, args[0].value, args[1].value, subtag)
                }
            ]
        });
    }

    public async setSlowmode(
        context: BBTagContext,
        channelStr: string,
        timeStr: string,
        subtag: SubtagCall
    ): Promise<string | void> {
        let time = parse.int(timeStr);
        let channel;
        const lookupChannel = await context.queryChannel(channelStr, { noLookup: true});//TODO yikes
        if (lookupChannel !== undefined)
            channel = lookupChannel;
        else {
            channel = context.channel;
            time = parse.int(channelStr);
        }

        if (isNaN(time)) time = 0;

        time = Math.min(time, 120);

        try {
            await channel.edit({
                rateLimitPerUser: time
            }, context.scope.reason ?? 'Initiated from BBTag by ' + humanize.fullName(context.user));
        } catch (err: unknown) {
            return this.customError('Missing required permissions', context, subtag);
        }
    }
}