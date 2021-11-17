import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class IndexOfSubtag extends Subtag {
    public constructor() {
        super({
            name: 'indexof',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('array', 'json[]'),
        Subtag.argument('query', 'string'),
        Subtag.argument('start', 'integer', { useFallback: true }).ifOmittedUse(0)
    ], {
        description: 'Finds the index of `query` in `array`, after `start`. If it\'s not found, returns -1.',
        exampleCode: 'The index of "is" in ["this","is","a","test"] is {indexof;["this","is","a","test"];is}',
        exampleOut: 'The index of "is" in ["this","is","a","test"] is 1'
    })
    public indexOfArray(array: JToken[], query: string, startIndex: number): number {
        return array.indexOf(query, startIndex); // TODO Convert each element to a string first?
    }

    @Subtag.signature('number', [
        Subtag.argument('text', 'string'),
        Subtag.argument('query', 'string'),
        Subtag.argument('start', 'integer', { useFallback: true }).ifOmittedUse(0)
    ], {
        description: 'Finds the index of `query` in `text`, after `start`. If it\'s not found, returns -1.',
        exampleCode: 'The index of "o" in "hello world" is {indexof;hello world;o}',
        exampleOut: 'The index of "o" in "hello world" is 4'
    })
    public indexOfString(text: string, query: string, startIndex: number): number {
        return text.indexOf(query, startIndex);
    }
}
