import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';

export class ChannelCategoriesSubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelcategories',
            category: SubtagType.CHANNEL,
            desc: 'Returns an array of category IDs on the current guild.',
            aliases: ['categories']
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.context()
    ], {
        exampleCode: 'This guild has {length;{categories}} categories.',
        exampleOut: 'This guild has 7 categories.'
    })
    public getChannelCategories(context: BBTagContext): string[] {
        return context.guild.channels.cache.filter(guard.isCategoryChannel).map(c => c.id);
    }
}
