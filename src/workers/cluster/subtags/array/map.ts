import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRef, RuntimeReturnState } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class MapSubtag extends Subtag {
    public constructor() {
        super({
            name: 'map',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('(string|error)[]', [
        Subtag.context(),
        Subtag.argument('variable', 'variable'),
        Subtag.argument('array', 'json[]', { isVariableName: 'maybe' }),
        Subtag.argument('code', 'deferred')
    ], {
        description: 'Provides a way to populate an array by executing a function on each of its elements,' +
            ' more info [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)\n' +
            'For every element in `array`, a variable called `variable` will be set to the current element. The output of `function`' +
            ' will be the new value of the element. This will return the new array, and will not modify the original.',
        exampleCode: '{map;~item;["apples","oranges","pears"];{upper;{get;~item}}}',
        exampleOut: '["APPLES","ORANGES","PEARS"]'
    })
    public async * map(context: BBTagContext, variable: BBTagRef, array: JArray, code: () => Awaitable<string>): AsyncIterable<string> {
        try {
            for (const item of array) {
                variable.set(item);
                yield await code();

                if (context.state.return !== RuntimeReturnState.NONE)
                    break;
            }
        } finally {
            variable.reset();
        }
    }
}
