import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RegexSplitSubtag extends Subtag {
    public constructor() {
        super({
            name: 'regexsplit',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string[]', [
        Subtag.argument('text', 'string'),
        Subtag.argument('regex', 'regex')
    ], {
        description: 'Splits the given text using the given `regex` as the split rule. Any bbtag in `regex` will not be resolved. Please consider using `{apply}` for a dynamic regex. ' +
            '`regex` will only succeed to compile if it is deemed a safe regular expression ' +
            '(safe regexes do not run in exponential time for any input) and is less than 2000 characters long.',
        exampleCode: '{regexsplit;Hello      there, I       am hungry;/[\\s,]+/}',
        exampleOut: '["Hello","there","I","am","hungry"]'
    })
    public regexSplit(text: string, regex: RegExp): string[] {
        return text.split(regex);
    }
}
