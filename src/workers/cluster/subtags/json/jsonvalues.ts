import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { bbtagUtil, SubtagType } from '@cluster/utils';

const json = bbtagUtil.json;

export class JsonValuesSubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonvalues',
            category: SubtagType.JSON,
            aliases: ['jvalues']
        });
    }

    @Subtag.signature('json[]', [
        Subtag.argument('object', 'json'),
        Subtag.argument('path', 'string', { ifOmitted: undefined })
    ], {
        description: 'Retrieves all values from provided the JSON object. ' +
            '`object` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.\n' +
            '`path` is a dot-noted series of properties.',
        exampleCode: '{set;~json;{json;{"key": "value", "key2" : "value2"}}\n'
            + '{jsonvalues;~json}',
        exampleOut: '["value","value2"]'
    })
    public getJsonValue(input: JToken, path?: string): JArray {
        try {
            if (path !== '')
                return Object.values(json.get(input, path ?? '') ?? []);
            return Object.values(input ?? []);
        } catch (e: unknown) {
            if (e instanceof Error)
                throw new BBTagRuntimeError(e.message);
            throw e;
        }
    }
}
