import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, InvalidOperatorError, NotANumberError } from '@cluster/bbtag/errors';
import { BBTagRef } from '@cluster/types';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';
import { CompareOperator } from '@cluster/utils/bbtag/operators';

export class ForSubtag extends Subtag {
    public constructor() {
        super({
            name: 'for',
            category: SubtagType.LOOPS
        });
    }

    @Subtag.signature('loop', [
        Subtag.context(),
        Subtag.argument('variable', 'variable'),
        Subtag.argument('initial', 'number', { parseError: 'Initial must be a number' }),
        Subtag.argument('operator', 'string').guard(Object.keys(bbtagUtil.operators.compare), value => new InvalidOperatorError(value, 'comparison')),
        Subtag.argument('limit', 'number', { parseError: 'Limit must be a number' }),
        Subtag.useValue(1),
        Subtag.argument('code', 'deferred')
    ], {
        mergeErrors: (errors) => new BBTagRuntimeError(errors.map(e => e.message).join(', ')),
        description: 'To start, `variable` is set to `initial`. Then, the tag will loop, first checking `variable` against `limit` using `comparison`. ' +
            'If the check succeeds, `code` will be run before `variable` being incremented by 1 and the cycle repeating.\n' +
            'This is very useful for repeating an action (or similar action) a set number of times. Edits to `variable` inside `code` will be ignored',
        exampleCode: '{for;~index;0;<;10;{get;~index},}',
        exampleOut: '0,1,2,3,4,5,6,7,8,9,'
    })
    @Subtag.signature('loop', [
        Subtag.context(),
        Subtag.argument('variable', 'variable'),
        Subtag.argument('initial', 'number', { parseError: 'Initial must be a number' }),
        Subtag.argument('operator', 'string').guard(Object.keys(bbtagUtil.operators.compare), value => new InvalidOperatorError(value, 'comparison')),
        Subtag.argument('limit', 'number', { parseError: 'Limit must be a number' }),
        Subtag.argument('increment', 'number', { parseError: 'Increment must be a number' }).ifOmittedUse(1),
        Subtag.argument('code', 'deferred')
    ], {
        mergeErrors: (errors) => new BBTagRuntimeError(errors.map(e => e.message).join(', ')),
        description: 'To start, `variable` is set to `initial`. Then, the tag will loop, first checking `variable` against `limit` using `comparison`. ' +
            'If the check succeeds, `code` will be run before `variable` being incremented by `increment` and the cycle repeating.\n' +
            'This is very useful for repeating an action (or similar action) a set number of times. Edits to `variable` inside `code` will be ignored',
        exampleCode: '{for;~index;0;<;10;2;{get;~index},}',
        exampleOut: '0,2,4,6,8,'
    })
    public async * for(context: BBTagContext, variable: BBTagRef, index: number, operator: CompareOperator, limit: number, increment: number, code: () => Awaitable<string>): AsyncIterable<string> {
        const initial = variable.get();
        try {
            for (; bbtagUtil.operators.compare[operator](index.toString(), limit.toString()); index += increment) {
                variable.set(index);
                yield await code();

                const varValue = variable.get();
                index = parse.float(varValue?.toString() ?? '');

                if (isNaN(index))
                    throw new NotANumberError(varValue);

                if (context.state.return !== 0)
                    break;
            }
        } finally {
            variable.set(initial);
        }
    }
}
