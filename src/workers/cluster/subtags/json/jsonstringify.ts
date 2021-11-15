import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class JsonStringifySubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonstringify',
            aliases: ['jstringify'],
            category: SubtagType.JSON
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('input', 'json', { isVariableName: 'maybe', ifOmitted: undefined }),
        Subtag.argument('indent', 'integer', { ifOmitted: 4 })
    ], {
        description: 'Pretty-prints the provided JSON `input` with the provided `indent`.',
        exampleCode: '{jsonstringify;["one","two","three"]}',
        exampleOut: '[\n    "one",\n    "two",\n    "three"\n]'
    })
    public jsonStringify(input: JToken = {}, indent: number): string {
        return JSON.stringify(input, null, indent);
    }
}
