import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels } from 'discord.js';

export class ChannelIsVoice extends Subtag {
    public constructor() {
        super({
            name: 'channelisvoice',
            aliases: ['isvoice'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Checks if the current channel is a voice channel.',
        exampleCode: '{if;{isvoice};How did you even call the command?;Yeah you can write stuff here}',
        exampleOut: 'Yeah you can write stuff here'
    })
    @Subtag.signature('boolean', [
        Subtag.argument('channel', 'channel', { quietErrorDisplay: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Checks if `channel` is a voice channel. If it cannot be found returns `No channel found`, or `false` if `quiet` is `true`.',
        exampleCode: '{isvoice;blarg podcats}',
        exampleOut: 'true'
    })
    public isVoiceChannel(channel: GuildChannels): boolean {
        return guard.isVoiceChannel(channel);
    }
}
