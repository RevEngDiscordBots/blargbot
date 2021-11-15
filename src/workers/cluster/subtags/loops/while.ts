import { BBTagContext, Subtag } from '@cluster/bbtag';
import { RuntimeReturnState } from '@cluster/types';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class WhileSubtag extends Subtag {
    public constructor() {
        super({
            name: 'while',
            category: SubtagType.LOOPS
        });
    }

    @Subtag.signature('loop', [
        Subtag.context(),
        Subtag.argument('boolean', 'deferred'),
        Subtag.useValue(() => '=='),
        Subtag.useValue(() => 'true'),
        Subtag.argument('code', 'deferred')
    ], {
        description: 'This will continuously execute `code` for as long as `boolean` returns `true`.',
        exampleCode: '{set;~x;0}\n{set;~end;false}\n{while;{get;~end};\n\t{if;{increment;~x};==;10;\n\t\t{set;~end;true}\n\t}\n}\n{get;~end}',
        exampleOut: '10'
    })
    @Subtag.signature('loop', [
        Subtag.context(),
        Subtag.argument('value1', 'deferred'),
        Subtag.argument('operator', 'deferred'),
        Subtag.argument('value2', 'deferred'),
        Subtag.argument('code', 'deferred')
    ], {
        description: 'This will continuously execute `code` for as long as the condition returns `true`. The condition is as follows:\n' +
            'If `operator` and `value2` are provided, `value1` is evaluated against `value2` using `operator`. ' +
            'Valid operators are `' + Object.keys(bbtagUtil.operators.compare).join('`, `') + '`.',
        exampleCode: '{set;~x;0}\n{while;{get;~x};<=;10;{increment;~x},}.',
        exampleOut: '1,2,3,4,5,6,7,8,9,10,11,'
    })
    public async * while(
        context: BBTagContext,
        val1: () => Awaitable<string>,
        evaluator: () => Awaitable<string>,
        val2: () => Awaitable<string>,
        code: () => Awaitable<string>
    ): AsyncIterable<string> {
        while (context.state.return === RuntimeReturnState.NONE) {
            let right = await val1();
            let operator = await evaluator();
            let left = await val2();

            if (bbtagUtil.operators.isCompareOperator(operator)) {
                //operator = operator;
            } else if (bbtagUtil.operators.isCompareOperator(left)) {
                //operator = left;
                [left, operator] = [operator, left];
            } else if (bbtagUtil.operators.isCompareOperator(right)) {
                //operator = right;
                [operator, right] = [right, operator];
            }

            if (!bbtagUtil.operators.isCompareOperator(operator))
                //TODO invalid operator stuff here
                yield await code();
            else if (!bbtagUtil.operators.compare[operator](right, left))
                break;
            else
                yield await code();
        }
    }
}
