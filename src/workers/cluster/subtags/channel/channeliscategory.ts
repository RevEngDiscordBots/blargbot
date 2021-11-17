import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels } from 'discord.js';

export class ChannelIsCategorySubtag extends Subtag {
    public constructor() {
        super({
            name: 'channeliscategory',
            aliases: ['iscategory'],
            category: SubtagType.CHANNEL
        });
    }

    @Subtag.signature('boolean', [
        Subtag.argument('channel', 'channel', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Checks if `channel` is a category. If it cannot be found returns `No channel found`, or `false` if `quiet` is `true`.',
        exampleCode: '{channeliscategory;cool category}\n{channeliscategory;category that doesn\'t exist}',
        exampleOut: 'true\n(nothing is returned here)'
    })
    public isCategory(channel: GuildChannels): boolean {
        return guard.isCategoryChannel(channel);
    }
}
