import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RegexReplaceSubtag extends Subtag {
    public constructor() {
        super({
            name: 'regexreplace',
            category: SubtagType.MISC,
            desc: 'Any bbtag in `regex` will not be resolved. Please consider using `{apply}` for a dynamic regex. ' +
                '`regex` will only succeed to compile if it is deemed a safe regular expression ' +
                '(safe regexes do not run in exponential time for any input) and is less than 2000 characters long.'
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('regex', 'regex'),
        Subtag.argument('replaceWith', 'string')
    ], {
        description: 'Replaces the `regex` phrase with `replacewith`. This is executed on the output of the containing tag.',
        exampleCode: 'I like to eat cheese. {regexreplace;/cheese/;pie}',
        exampleOut: 'I like to eat pie.'
    })
    public setOutputReplacement(context: BBTagContext, regex: RegExp, replacement: string): void {
        context.state.replace = { regex: regex, with: replacement };
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('regex', 'regex'),
        Subtag.argument('replaceWith', 'string')
    ], {
        description: 'Replace the `regex` phrase with `replaceWith`. This is executed on `text`.',
        exampleCode: 'I like {regexreplace;to consume;/o/gi;a} cheese. {regexreplace;/e/gi;n}',
        exampleOut: 'I likn ta cansumn chnnsn.'
    })
    public regexReplace(text: string, regex: RegExp, replaceWith: string): string {
        return text.replace(regex, replaceWith);
    }
}
