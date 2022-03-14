import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { bbtag, SubtagType } from '@blargbot/cluster/utils';

export class JsonKeysSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'jsonkeys',
            category: SubtagType.JSON,
            aliases: ['jkeys'],
            definition: [
                {
                    parameters: ['object', 'path?'],
                    description: 'Retrieves all keys from provided the JSON object. ' +
                        '`object` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.\n' +
                        '`path` is a dot-noted series of properties.',
                    exampleCode: '{set;~json;{json;{"key": "value", "key2" : "value2"}}\n' +
                        '{jsonkeys;~json}',
                    exampleOut: '["key","key2"]',
                    returns: 'string[]',
                    execute: (ctx, [object, path]) => this.getJsonKeys(ctx, object.value, path.value)
                }
            ]
        });
    }

    public async getJsonKeys(context: BBTagContext, objStr: string, path: string): Promise<string[]> {
        const obj = (await bbtag.json.resolveObj(context, objStr)).object;

        if (path !== '')
            return Object.keys(bbtag.json.get(obj, path) ?? {});

        return Object.keys(obj);
    }
}