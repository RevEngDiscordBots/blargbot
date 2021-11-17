import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRef } from '@cluster/types';
import { parse, SubtagType } from '@cluster/utils';

export class FilterSubtag extends Subtag {
    public constructor() {
        super({
            name: 'filter',
            category: SubtagType.LOOPS
        });
    }

    @Subtag.signature('json[]', [
        Subtag.context(),
        Subtag.argument('variable', 'variable'),
        Subtag.argument('array', 'json[]', { isVariableName: 'maybe' }).catch('[]'),
        Subtag.argument('code', 'deferred')
    ], {
        description: 'For every element in `array`, a variable called `variable` will be set and `code` will be executed. Returns a new array containing all the elements that returned the value `true`.',
        exampleCode: '{set;~array;apples;apple juice;grapefruit}\n{filter;~element;~array;{bool;{get;~element};startswith;apple}}',
        exampleOut: '["apples","apple juice"]'
    })
    public async * filter(context: BBTagContext, variable: BBTagRef, source: JArray, code: () => Awaitable<string>): AsyncIterable<JToken> {
        const initial = variable.get();
        try {
            for (const item of source) {
                variable.set(item);
                const res = await code();
                if (context.state.return !== 0)
                    break;

                if (parse.boolean(res, false))
                    yield item;
            }
        } finally {
            variable.set(initial);
        }
    }
}
