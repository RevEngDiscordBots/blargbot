import { RegexSubtag } from '@blargbot/cluster/bbtag';
import { SubtagType } from '@blargbot/cluster/utils';

export class RegexMatchSubtag extends RegexSubtag {
    public constructor() {
        super({
            name: 'regexmatch',
            category: SubtagType.ARRAY, //? Why?
            definition: [
                {
                    parameters: ['text', '~regex'],
                    description: 'Returns an array of everything in `text` that matches `regex`. Any bbtag in `regex` will not be resolved. Please consider using `{apply}` for a dynamic regex. ' +
                        '`regex` will only succeed to compile if it is deemed a safe regular expression ' +
                        '(safe regexes do not run in exponential time for any input) and is less than 2000 characters long.',
                    exampleCode: '{regexmatch;I have $1 and 25 cents;/\\d+/g}',
                    exampleOut: '["1", "25"]',
                    returns: 'string[]',
                    execute: (_, [text, regex]) => this.regexMatch(text.value, regex.raw)
                }
            ]
        });
    }

    public regexMatch(text: string, regexStr: string): RegExpMatchArray {
        const regex = this.createRegex(regexStr);
        const matches = text.match(regex);
        if (matches === null)
            return [];
        return matches;
    }
}