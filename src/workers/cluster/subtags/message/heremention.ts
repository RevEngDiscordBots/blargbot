import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class HereMentionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'heremention',
            aliases: ['here'],
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('mention', 'boolean').catch(true).ifOmittedUse(true)
    ], {
        description: 'Returns the mention of `@here`.\nThis requires the `disableeveryone` setting to be false. If `mention` is set to `true`, `@here` will ping, else it will be silent.',
        exampleCode: '{heremention}',
        exampleOut: '@here'
    })
    public hereMention(context: BBTagContext, shouldMention: boolean): string {
        context.state.allowedMentions.everybody = shouldMention;
        return '@here';
    }
}
