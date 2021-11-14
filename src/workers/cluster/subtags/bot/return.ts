import { BBTagContext, Subtag } from '@cluster/bbtag';
import { RuntimeReturnState } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class ReturnSubtag extends Subtag {
    public constructor() {
        super({
            name: 'return',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('force', 'boolean', { ifOmitted: true, ifInvalid: true })
    ])
    public setReturn(context: BBTagContext, forced: boolean): void {
        context.state.return = forced ? RuntimeReturnState.ALL : RuntimeReturnState.CURRENTTAG;
    }
}
