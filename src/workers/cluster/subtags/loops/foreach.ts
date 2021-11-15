import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRef } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class ForeachSubtag extends Subtag {
    public constructor() {
        super({
            name: 'foreach',
            category: SubtagType.LOOPS
        });
    }

    @Subtag.signature('loop', [
        Subtag.context(),
        Subtag.argument('variable', 'variable'),
        Subtag.argument('array', 'json[]', { isVariableName: 'maybe', ifInvalid: [] }),
        Subtag.argument('code', 'deferred')
    ], {
        description: 'For every element in `array`, a variable called `variable` will be set and then `code` will be run.\n' +
            'If `element` is not an array, it will iterate over each character intead.',
        exampleCode: '{set;~array;apples;oranges;c#}\n{foreach;~element;~array;I like {get;~element}{newline}}',
        exampleOut: 'I like apples\nI like oranges\nI like c#'
    })
    public async * foreach(context: BBTagContext, variable: BBTagRef, array: JArray, code: () => Awaitable<string>): AsyncIterable<string> {
        const initial = variable.get();
        try {
            for (const item of array) {
                variable.set(item);
                yield await code();

                if (context.state.return !== 0)
                    break;
            }
        } finally {
            variable.set(initial);
        }
    }
}
