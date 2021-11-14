import { BBTagContext, Subtag } from '@cluster/bbtag';
import { RuntimeReturnState } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class MapSubtag extends Subtag {
    public constructor() {
        super({
            name: 'map',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('(string|error)[]', [
        Subtag.context,
        Subtag.parameter('variable', 'string'),
        Subtag.parameter('array', 'json[]', { isVariableName: 'maybe' }),
        Subtag.parameter('code', 'deferred')
    ], {
        description: 'Provides a way to populate an array by executing a function on each of its elements,' +
            ' more info [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)\n' +
            'For every element in `array`, a variable called `variable` will be set to the current element. The output of `function`' +
            ' will be the new value of the element. This will return the new array, and will not modify the original.',
        exampleCode: '{map;~item;["apples","oranges","pears"];{upper;{get;~item}}}',
        exampleOut: '["APPLES","ORANGES","PEARS"]'
    })
    public async * map(context: BBTagContext, varName: string, array: JArray, code: () => Awaitable<string>): AsyncIterable<string> {
        try {
            for (const item of array) {
                await context.limit.check(context, 'map:loops');
                await context.variables.set(varName, item);
                yield await code();

                if (context.state.return !== RuntimeReturnState.NONE)
                    break;
            }
        } finally {
            await context.variables.reset(varName);
        }
    }
}
