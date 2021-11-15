import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { bbtagUtil, SubtagType } from '@cluster/utils';

const json = bbtagUtil.json;

export class JsonGetSubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonget',
            category: SubtagType.JSON,
            aliases: ['jget']
        });
    }

    @Subtag.signature('json?', [
        Subtag.argument('input', 'json', { isVariableName: 'maybe' }),
        Subtag.argument('path', 'string', { ifOmitted: undefined })
    ], {
        description: 'Navigates the path of a JSON object. Works with arrays too!\n' +
            '`input` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.\n' +
            '`path` is a dot-noted series of properties.',
        exampleCode: '{jsonget;{j;{\n  "array": [\n    "zero",\n    { "value": "one" },\n    "two"\n  ]\n}};array.1.value}',
        exampleOut: 'one'
    })
    public jsonGet(input: JToken, path?: string): JToken | undefined {
        if (input === '')
            input = '{}';

        try {
            return json.get(input, path ?? '');
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new BBTagRuntimeError(err.message);
            throw err;
        }
    }
}
