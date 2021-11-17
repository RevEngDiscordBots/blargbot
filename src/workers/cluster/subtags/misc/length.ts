import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class LengthSubtag extends Subtag {
    public constructor() {
        super({
            name: 'length',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('array', 'json[]')
    ], {
        description: 'Gives the amount of characters in `value`, or the number of elements if it is an array.',
        exampleCode: '{set;~myArray;a;b;c}\n~myArray is {length;{get;~myArray}} elements long.',
        exampleOut: '~myArray is 3 elements long.'
    })
    public getArrayLength(array: JToken[]): number {
        return array.length;
    }

    @Subtag.signature('number', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Gives the amount of characters in `value`, or the number of elements if it is an array.',
        exampleCode: 'The alphabet is {length;abcdefghijklmnopqrstuvwxyz} letters long.',
        exampleOut: 'The alphabet is 26 letters long.'
    })
    public getStringLength(text: string): number {
        return text.length;
    }
}
