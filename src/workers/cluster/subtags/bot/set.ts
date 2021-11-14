import { BBTagContext, Subtag, tagVariableScopes } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SetSubtag extends Subtag {
    public constructor() {
        super({
            name: 'set',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('variableName', 'string')
    ], {
        description: 'Sets the `name` variable to nothing.',
        exampleCode: '{set;~var;something}\n{set;~var}\n{get;~var}',
        exampleOut: '(returns nothing)'
    })
    public async clearVariable(context: BBTagContext, variableName: string): Promise<void> {
        await context.variables.set(variableName, undefined);
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('variableName', 'string'),
        Subtag.argument('value', 'json')
    ], {
        description: 'Stores `value` under `name`. These variables are saved between sessions. ' +
            'You can use a character prefix to determine the scope of your variable.\n' +
            'Valid scopes are: ' + tagVariableScopes.map((s) => `${s.prefix.length === 0 ? 'no prefix' : `\`${s.prefix}\``} (${s.name})`).join(', ') +
            '.\nFor performance reasons, variables are not immediately stored to the database. See `{commit}` and `{rollback}`' +
            'for more information, or use `b!t docs variable` or `b!cc docs variable`',
        exampleCode: '{set;var1;This is local var1}\n{set;~var2;This is temporary var2}\n{get;var1}\n{get;~var2}',
        exampleOut: 'This is local var1\nThis is temporary var2'
    })
    public async setVariable(context: BBTagContext, variableName: string, value: JToken): Promise<void> {
        await context.variables.set(variableName, value ?? undefined);
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('variableName', 'string'),
        Subtag.argument('value', 'string', { repeat: [0, Infinity] }) // TODO: Maybe json data type?
    ], {
        description: 'Stores an array under `name`.' +
            '\nWhen getting the array, you\'ll notice it retrieved an object, ' +
            'In this object `v` is the array itself, and `n` is the `name` of the variable. ' +
            'If the array itself needs to be returned instead of object, in for example `{jset;;array;{get;~array}}`, you can use `{slice;<arrayname>;0}`. In array subtags `{get} will work as intended.`',
        exampleCode: '{set;var3;this;is;an;array}\n{get;var3}',
        exampleOut: '{"v":["this","is","an","array"],"n":"var3"}'
    })
    public async setArray(context: BBTagContext, variableName: string, arrayElements: string[]): Promise<void> {
        const result = [];
        for (const element of arrayElements) {
            try {
                const parsedElement = JSON.parse(element);
                if (typeof parsedElement === 'number') {
                    result.push(element); //Might be snowflake
                    continue;             //TODO better logic for this
                }
                result.push(parsedElement);
            } catch (e: unknown) {
                result.push(element);
            }
        }
        await context.variables.set(variableName, result);
    }
}
