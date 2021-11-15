import { Subtag } from '@cluster/bbtag';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class JsonCleanSubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonclean',
            category: SubtagType.JSON,
            aliases: ['jclean']
        });
    }

    @Subtag.signature('json', [
        Subtag.argument('input', 'json')
    ], {
        description: 'Using the `input` as a base, cleans up the JSON file structure, parsing stringified nested objects/arrays. Will not mutate the original object.',
        exampleCode: '{jsonclean;{j;{"test":"[]"}}}',
        exampleOut: '{"test":[]}'
    })
    public cleanJson(input: JToken): JToken {
        return bbtagUtil.json.clean(input);
    }
}
