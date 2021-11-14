import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class ShiftSubtag extends Subtag {
    public constructor() {
        super({
            name: 'shift',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('json|nothing', [
        Subtag.parameter('array', 'json[]', { isVariableName: 'maybe' })
    ], {
        description: 'Returns the first element in `array`. If used with a variable this will remove the first element from `array` as well.',
        exampleCode: '{shift;["this", "is", "an", "array"]}',
        exampleOut: 'this'
    })
    public shift(array: JArray): JToken | undefined {
        return array.shift();
    }
}
