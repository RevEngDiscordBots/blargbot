import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels } from 'discord.js';

export class ChannelIsText extends Subtag {
    public constructor() {
        super({
            name: 'channelistext',
            aliases: ['istext'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(ctx => ctx.channel)
    ], {
        description: 'Checks if the current channel is a text channel.',
        exampleCode: '{if;{istext};Yeah you can write stuff here;How did you even call the command?}',
        exampleOut: 'Yeah you can write stuff here'
    })
    @Subtag.signature('boolean', [
        Subtag.argument('channel', 'channel', { quietErrorDisplay: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Checks if `channel` is a text channel. If it cannot be found returns `No channel found`, or `false` if `quiet` is `true`.',
        exampleCode: '{istext;feature discussions}',
        exampleOut: 'true'
    })
    public isTextChannel(channel: GuildChannels): boolean {
        return guard.isTextableChannel(channel);
    }
}
