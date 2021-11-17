import { Subtag } from '@cluster/bbtag';
import { BBTagRef } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class ReverseSubtag extends Subtag {
    public constructor() {
        super({
            name: 'reverse',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Reverses the order of `text`.',
        exampleCode: '{reverse;palindrome}',
        exampleOut: 'emordnilap'
    })
    public reverseString(text: string): string {
        return text.split('').reverse().join('');
    }

    @Subtag.signature('json[]', [
        Subtag.argument('array', 'json[]')
    ], {
        description: 'Reverses the order of `array`.',
        exampleCode: '{reverse;[1,2,3,4,5]}',
        exampleOut: '[5,4,3,2,1]'
    })
    public reverseArrayLiteral(array: JArray): JArray {
        return array.reverse();
    }

    @Subtag.signature('nothing', [
        Subtag.argument('array', 'json[]*')
    ], {
        description: 'Reverses the order of `array` and ',
        exampleCode: '{set;~myarray;a;b;c;d;e}\n{reverse;~myarray}\n{get;~myarray}',
        exampleOut: '{"n":"~myarray","v":["e","d","c","b","a"]}'
    })
    public reverseArrayVariable(array: BBTagRef<JArray>): void {
        array.set(array.get().reverse());
    }
}
