import { Subtag } from '@cluster/bbtag';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class SpliceSubtag extends Subtag {
    public constructor() {
        super({
            name: 'splice',
            category: SubtagType.ARRAY,
            desc: 'If used with a variable this will modify the original array.\nReturns an array of removed items.'
        });
    }

    @Subtag.signature('json[]', [
        Subtag.argument('array', 'json[]', { isVariableName: 'maybe' }),
        Subtag.argument('start', 'number', { useFallback: true }),
        Subtag.argument('deleteCount', 'number', { useFallback: true }).ifOmittedUse(0),
        Subtag.argument('items', 'string').repeat(0, Infinity)
    ], {
        description: 'Removes `deleteCount` elements from `array` starting at `start` and returns them.\n' +
            'If any `items` were provided, this will then insert them all at the `start` index',
        exampleCode: '{splice;["this", "is", "an", "array"];1;1}',
        exampleOut: '["is"]'
    })
    public spliceArray(array: JArray, start: number, count: number, replaceItems: string[]): JArray {
        return array.splice(start, count, ...bbtagUtil.tagArray.flattenArray(replaceItems));
    }
}
