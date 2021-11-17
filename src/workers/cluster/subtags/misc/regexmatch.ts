import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RegexMatchSubtag extends Subtag {
    public constructor() {
        super({
            name: 'regexmatch',
            category: SubtagType.MISC //? Why?
        });
    }

    @Subtag.signature('string[]', [
        Subtag.argument('text', 'string'),
        Subtag.argument('regex', 'regex')
    ], {
        description: 'Returns an array of everything in `text` that matches `regex`. Any bbtag in `regex` will not be resolved. Please consider using `{apply}` for a dynamic regex. ' +
            '`regex` will only succeed to compile if it is deemed a safe regular expression ' +
            '(safe regexes do not run in exponential time for any input) and is less than 2000 characters long.',
        exampleCode: '{regexmatch;I have $1 and 25 cents;/\\d+/g}',
        exampleOut: '["1", "25"]'
    })
    public regexMatch(text: string, regex: RegExp): RegExpMatchArray {
        const matches = regex.exec(text);
        if (matches === null)
            return [];
        return matches;
    }
}
