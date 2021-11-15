import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class RepeatSubtag extends Subtag {
    public constructor() {
        super({
            name: 'repeat',
            category: SubtagType.LOOPS,
            aliases: ['loop']
        });
    }

    @Subtag.signature('loop', [
        Subtag.context(),
        Subtag.argument('code', 'deferred'),
        Subtag.argument('amount', 'number')
    ], {
        description: 'Repeatedly executes `code` `amount` times.',
        exampleCode: '{repeat;e;10}',
        exampleOut: 'eeeeeeeeee'
    })
    public async* repeat(context: BBTagContext, code: () => Awaitable<string>, amount: number): AsyncIterable<string> {
        if (amount < 0)
            throw new BBTagRuntimeError('Can\'t be negative');

        for (let i = 0; i < amount; i++) {
            yield await code();
            if (context.state.return !== 0)
                break;
        }
    }
}
