import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class PrefixSubtag extends Subtag {
    public constructor() {
        super({
            name: 'prefix',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('string', [
        Subtag.context()
    ], {
        description: 'Gets the current guild\'s prefix.',
        exampleCode: 'Your prefix is {prefix}',
        exampleOut: 'Your prefix is b!'
    })
    public async getPrefix(context: BBTagContext): Promise<string> {
        const prefix = await context.database.guilds.getSetting(context.guild.id, 'prefix');
        switch (typeof prefix) {
            case 'string': return prefix;
            case 'undefined': return context.engine.util.config.discord.defaultPrefix;
            default: return prefix[0];
        }
    }
}
