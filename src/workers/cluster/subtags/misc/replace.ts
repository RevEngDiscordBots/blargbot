import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class ReplaceSubtag extends Subtag {
    public constructor() {
        super({
            name: 'replace',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('phrase', 'string'),
        Subtag.argument('replaceWith', 'string')
    ], {
        description: 'Replaces the first occurence of `phrase` in `text` with `replaceWith`.',
        exampleCode: 'I like {replace;to eat;eat;nom} cheese. {replace;cheese;ham}',
        exampleOut: 'I like to nom ham. ham'
    })
    public replace(text: string, phrase: string, replacement: string): string {
        return text.replace(phrase, replacement);
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('phrase', 'string'),
        Subtag.argument('replaceWith', 'string')
    ], {
        description: 'Replaces the first occurence of `phrase` with `replaceWith`. This is executed on the output from the containing tag.',
        exampleCode: 'Hello world! {replace;Hello;Bye}',
        exampleOut: 'Bye world!'
    })
    public setOutputReplacement(context: BBTagContext, phrase: string, replacement: string): void {
        context.state.replace = {
            regex: phrase,
            with: replacement
        };
    }
}
