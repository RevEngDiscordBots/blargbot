import { BBTagContext, DefinedSubtag } from '@cluster/bbtag';
import { NotAnArrayError } from '@cluster/bbtag/errors';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class PushSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'push',
            category: SubtagType.ARRAY,
            definition: [
                {
                    parameters: ['array', 'values+'],
                    description: 'Pushes `values` onto the end of `array`. If provided a variable, this will update the original variable. Otherwise, it will simply output the new array.',
                    exampleCode: '{push;["this", "is", "an"];array}',
                    exampleOut: '["this","is","an","array"]',
                    returns: 'json[]|nothing',
                    execute: (context, [array, ...values]) => this.push(context, array.value, values.map(v => v.value))
                }
            ]
        });
    }

    public async push(context: BBTagContext, arrayStr: string, values: string[]): Promise<JArray | undefined> {
        const { n: varName, v: array } = await bbtagUtil.tagArray.deserializeOrGetArray(context, arrayStr) ?? {};

        if (array === undefined)
            throw new NotAnArrayError(arrayStr);

        array.push(...values);
        if (varName === undefined)
            return array;

        await context.variables.set(varName, array);
        return undefined;
    }
}
