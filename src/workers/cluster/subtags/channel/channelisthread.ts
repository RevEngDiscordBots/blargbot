import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels } from 'discord.js';

export class ChannelIsThread extends Subtag {
    public constructor() {
        super({
            name: 'channelisthread',
            aliases: ['isthread'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Checks if the current channel is a thread channel.',
        exampleCode: '{if;{isthread};Cool, this is a thread channel!;Boo, this is a regular text channel}',
        exampleOut: 'Cool, this is a thread channel!'
    })
    @Subtag.signature('boolean', [
        Subtag.argument('channel', 'channel', { quietErrorDisplay: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Checks if `channel` is a thread channel. If it cannot be found returns `No channel found`, or `false` if `quiet` is `true`.',
        exampleCode: '{isthread;blarg podcats}',
        exampleOut: 'true'
    })
    public isThreadChannel(channel: GuildChannels): boolean {
        return guard.isThreadChannel(channel);
    }
}
