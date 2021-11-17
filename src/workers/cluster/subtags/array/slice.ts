import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SliceSubtag extends Subtag {
    public constructor() {
        super({
            name: 'slice',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('json[]', [
        Subtag.argument('array', 'json[]', { isVariableName: 'maybe' }),
        Subtag.argument('start', 'number', { useFallback: true }),
        Subtag.argument('end', 'number', { useFallback: true }).allowOmitted()
    ], {
        description: '`end` defaults to the length of the array.\n\n' +
            'Grabs elements between the zero-indexed `start` and `end` points (inclusive) from `array`.',
        exampleCode: '{slice;["this", "is", "an", "array"];1}',
        exampleOut: '["is","an","array"]'
    })
    public slice(array: JArray, start: number, end?: number): JArray {
        return array.slice(start, end);
    }
}
