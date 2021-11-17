import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RegexTestSubtag extends Subtag {
    public constructor() {
        super({
            name: 'regextest',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('boolean', [
        Subtag.argument('text', 'string'),
        Subtag.argument('regex', 'regex')
    ], {
        description: 'Tests if the `regex` phrase matches the `text`, and returns a boolean (true/false). Any bbtag in `regex` will not be resolved. Please consider using `{apply}` for a dynamic regex. ' +
            '`regex` will only succeed to compile if it is deemed a safe regular expression ' +
            '(safe regexes do not run in exponential time for any input) and is less than 2000 characters long.',
        exampleCode: '{regextest;apple;/p+/i} {regextest;banana;/p+/i}',
        exampleOut: 'true false'
    })
    public regexTest(text: string, regex: RegExp): boolean {
        return regex.test(text);
    }
}
