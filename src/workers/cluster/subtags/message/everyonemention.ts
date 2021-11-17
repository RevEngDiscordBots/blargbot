import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class EveryoneMentionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'everyonemention',
            aliases: ['everyone'],
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('mention', 'boolean').catch(true).ifOmittedUse(true)
    ], {
        description: 'Returns the mention of `@everyone`.\nThis requires the `disableeveryone` setting to be false. If `mention` is set to `true`, `@everyone` will ping, else it will be silent.',
        exampleCode: '{everyonemention}',
        exampleOut: '@everyone'
    })
    public everyoneMention(context: BBTagContext, shouldMention: boolean): string {
        context.state.allowedMentions.everybody = shouldMention;
        return '@everyone';
    }
}
