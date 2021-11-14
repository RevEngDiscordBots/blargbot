import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class PopSubtag extends Subtag {
    public constructor() {
        super({
            name: 'pop',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('json|nothing', [
        Subtag.parameter('array', 'json[]', { isVariableName: 'maybe' })
    ], {
        description: 'Returns the last element in `array`. If provided a variable, this will remove the last element from `array`as well.',
        exampleCode: '{pop;["this", "is", "an", "array"]}',
        exampleOut: 'array'
    })
    public pop(array: JArray): JToken | undefined {
        return array.pop();
    }
}
