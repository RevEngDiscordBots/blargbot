import { Subtag, tagVariableScopes } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class GetSubtag extends Subtag {
    public constructor() {
        super({
            name: 'get',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('json?', [
        Subtag.argument('variableName', 'json?', { isVariableName: true })
    ], {
        description: 'Returns the stored variable `varName`.\n' +
            'You can use a character prefix to determine the scope of your variable.\n' +
            'Valid scopes are: ' + tagVariableScopes.map((s) => `${s.prefix.length === 0 ? 'no prefix' : `\`${s.prefix}\``} (${s.name})`).join(', ') +
            '. For more information, use `b!t docs variable` or `b!cc docs variable`',
        exampleCode: '{set;var1;This is local var1}\n{set;~var2;This is temporary var2}\n{get;var1}\n{get;~var2}',
        exampleOut: 'This is local var1\nThis is temporary var2'
    })
    public get(value: JToken | undefined): JToken | undefined {
        return value;
    }

    @Subtag.signature('json?', [
        Subtag.argument('variableName', 'json?', { isVariableName: true }),
        Subtag.argument('index', 'integer')
    ], {
        description: 'When variable `name` is an array this will return the element at index `index`.' +
            ' If `index` is empty the entire array will be returned. If variable is not an array it will return the whole variable.'
    })
    public getArray(value: JToken | undefined, index: number): JToken | undefined {
        if (!Array.isArray(value))
            return value;

        if (index < 0 || index >= value.length)
            throw new BBTagRuntimeError('Index out of range');

        return value[index];
    }
}
