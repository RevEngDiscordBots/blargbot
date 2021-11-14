import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { Statement } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class FunctionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'function',
            category: SubtagType.BOT,
            aliases: ['func']
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('name', 'string'),
        Subtag.argument('code', 'ast')
    ], {
        description: 'Defines a function called `name`. Functions are called in the same way as subtags, however they are prefixed with `func.`. ' +
            'While inside the `code` block of a function, you may use the `params`, `paramsarray` and `paramslength` subtags to access the values ' +
            'passed to the function. These function identically to their `args` counterparts.\n\n' +
            'Please note that there is a recursion limit of 200 which is also shared by `{exec}`, `{execcc}` and `{inject}`.',
        exampleCode: '{function;test;{paramsarray}} {func.test;1;2;3;4}',
        exampleOut: '["1","2","3","4"]'
    })
    public createFunction(context: BBTagContext, funcName: string, code: Statement): void {
        let name = funcName.toLowerCase();
        if (name.startsWith('func.'))
            name = name.slice(5);

        if (name === '')
            throw new BBTagRuntimeError('Must provide a name');

        context.scopes.root.functions[name] = code;
    }
}
