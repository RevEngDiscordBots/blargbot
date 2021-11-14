import { Subtag } from '@cluster/bbtag';
import { BBTagRef } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class PushSubtag extends Subtag {
    public constructor() {
        super({
            name: 'push',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('nothing', [
        Subtag.argument('array', 'json[]*', { isVariableName: 'maybe' }),
        Subtag.argument('values', 'string', { repeat: [0, Infinity] })
    ], {
        description: 'Pushes `values` onto the end of `array`. If provided a variable, this will update the original variable. Otherwise, it will simply output the new array.',
        exampleCode: '{push;{get;~myArray};value1;value2}',
        exampleOut: ''
    })
    public pushVariable(array: BBTagRef<JArray>, values: string[]): void {
        array.value.push(...values);
    }

    @Subtag.signature('json[]', [
        Subtag.argument('array', 'json[]'),
        Subtag.argument('values', 'string', { repeat: [0, Infinity] })
    ], {
        description: 'Pushes `values` onto the end of `array`. If provided a variable, this will update the original variable. Otherwise, it will simply output the new array.',
        exampleCode: '{push;["this", "is", "an"];array;!}',
        exampleOut: '["this","is","an","array","!"]'
    })
    public pushLiteral(array: JArray, values: string[]): JArray {
        array.push(...values);
        return array;
    }
}
