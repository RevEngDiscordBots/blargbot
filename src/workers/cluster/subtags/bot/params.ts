import { BBTagContext, ParseResult, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, NotEnoughArgumentsError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class ParamsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'params',
            category: SubtagType.BOT
        });
    }
    @Subtag.signature('string', [
        Subtag.context()
    ], {
        description: 'Gets the whole input given to the current function call',
        exampleCode: '{func;test;You gave the parameters `{params}`}\n{func.test;Hello world!;BBtag is so cool}',
        exampleOut: 'You gave the parameters `Hello world! BBtag is so cool`'
    })
    public getAllParams(context: BBTagContext): string {
        const params = context.scopes.local.paramsarray;
        if (params === undefined)
            throw new BBTagRuntimeError('{params} can only be used inside {function}');

        return params.join(' ');
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('index', 'integer')
    ], {
        description: 'Gets a parameter passed to the current function call',
        exampleCode: '{func;test;The first parameter is `{params;0}`}\n{func.test;Hello world!;BBtag is so cool}',
        exampleOut: 'The first parameter is `Hello world!`'
    })
    public getParam(context: BBTagContext, index: number): string {
        const params = context.scopes.local.paramsarray;
        if (params === undefined)
            throw new BBTagRuntimeError('{params} can only be used inside {function}');

        return params[index];
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('start', 'integer'),
        Subtag.argument('end', 'integer', { ifInvalid: parseEnd })
    ], {
        description: 'Gets all the parameters given from `start` up to `end`. If `end` is `n` then all parameters after `start` will be returned. ' +
            '`start` and `end` will be sorted first if they arent in order.',
        exampleCode: '{func;test;The first parameter is `{params;2;4}`}\n{func.test;A;B;C;D;E;F}',
        exampleOut: 'C D'
    })
    public getParams(
        context: BBTagContext,
        start: number,
        end: number
    ): string {
        const params = context.scopes.local.paramsarray;
        if (params === undefined)
            throw new BBTagRuntimeError('{params} can only be used inside {function}');

        [start, end] = [start, end].sort();
        if (params.length <= start || start < 0)
            throw new NotEnoughArgumentsError(start, params.length);

        return params.slice(start, end).join(' ');
    }
}

function parseEnd(value: string): ParseResult<number> {
    if (value.toLowerCase() === 'n')
        return { success: true, value: Infinity };
    return { success: false };
}
