import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { BBTagRef } from '@cluster/types';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class JsonSetSubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonset',
            category: SubtagType.JSON,
            aliases: ['jset']
        });
    }

    @Subtag.signature('nothing', [
        Subtag.argument('json', 'json*', { isVariableName: 'maybe' }),
        Subtag.argument('path', 'string'),
        Subtag.useValue(undefined),
        Subtag.useValue(false)
    ], {
        description: 'Deletes the value at `path`. `input` can be a JSON object or array',
        exampleCode: '{set;~json;{json;{"key" : "value"}}}\n{jset;~json;key}\n{get;~json}',
        exampleOut: '{}'
    })
    @Subtag.signature('nothing', [
        Subtag.argument('json', 'json*', { isVariableName: 'maybe' }),
        Subtag.argument('path', 'string'),
        Subtag.argument('value', 'json'),
        Subtag.argument('create', 'boolean', { ifOmitted: false, mode: 'notEmpty' })
    ], {
        description: 'Using the `input` as a base, navigates the provided dot-notated `path` and assigns the `value`. ' +
            '`input` must be a variable name, or an array retrieved from `{get}`. The variable/array will then be updated with the new values\n' +
            'If `create` is not empty, will create/convert any missing keys.',
        exampleCode: '{jsonset;~json;path.to.key;value;create}\n{get;~json}',
        exampleOut: '{"path":{"to":{"key":"value"}}}'
    })
    public setReferenceValue(item: BBTagRef<JToken>, path: string, value: JToken | undefined, create: boolean): void {
        try {
            item.value = bbtagUtil.json.set(item.value, path, value, value !== undefined && create);
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new BBTagRuntimeError(err.message);
            throw err;
        }
    }

    @Subtag.signature('json', [
        Subtag.argument('json', 'json'),
        Subtag.argument('path', 'string'),
        Subtag.useValue(undefined),
        Subtag.useValue(false)
    ], {
        description: 'Deletes the value at `path`. `input` can be a JSON object or array',
        exampleCode: '{jset;{json;{"key" : "value"}};key}',
        exampleOut: '{}'
    })
    @Subtag.signature('json', [
        Subtag.argument('input', 'json'),
        Subtag.argument('path', 'string'),
        Subtag.argument('value', 'json'),
        Subtag.argument('create', 'boolean', { ifOmitted: false, mode: 'notEmpty' })
    ], {
        description: 'Using the `input` as a base, navigates the provided dot-notated `path` and assigns the `value`. ' +
            '`input` can be a JSON object or an array.\n' +
            'If `create` is not empty, will create/convert any missing keys.',
        exampleCode: '{jsonset;;path.to.key;value;create}',
        exampleOut: '{"path":{"to":{"key":"value"}}}'
    })
    public setLiteralValue(item: JToken, path: string, value: JToken | undefined, create: boolean): JToken {
        try {
            return bbtagUtil.json.set(item, path, value, value !== undefined && create);
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new BBTagRuntimeError(err.message);
            throw err;
        }
    }
}
