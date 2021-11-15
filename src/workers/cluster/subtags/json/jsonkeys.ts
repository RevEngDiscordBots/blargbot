import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { bbtagUtil, SubtagType } from '@cluster/utils';

const json = bbtagUtil.json;

export class JsonKeysSubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonkeys',
            aliases: ['jkeys'],
            category: SubtagType.JSON
        });
    }

    @Subtag.signature('string[]', [
        Subtag.argument('json', 'json', { isVariableName: 'maybe' }),
        Subtag.argument('path', 'string', { ifOmitted: undefined })
    ], {
        description: 'Retrieves all keys from provided the JSON object. ' +
            '`object` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.\n' +
            '`path` is a dot-noted series of properties.',
        exampleCode: '{set;~json;{json;{"key": "value", "key2" : "value2"}}\n' +
            '{jsonkeys;~json}',
        exampleOut: '["key","key2"]'
    })
    public getJsonKeys(item: JToken, path?: string): string[] {
        try {
            if (path !== undefined) {
                const objAtPath = json.get(item, path);
                return Object.keys(objAtPath ?? {});
            }
            return Object.keys(item ?? {});
        } catch (e: unknown) {
            if (e instanceof Error)
                throw new BBTagRuntimeError(e.message);
            throw e;
        }
    }
}
