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
        Subtag.argument('force', 'boolean').catch(true).ifOmittedUse(true)
    ], {
        description: 'Stops execution of the tag and returns what has been parsed. ' +
            'If `force` is `true` then it will also return from any tags calling this tag.',
        exampleCode: 'This will display. {return} This will not.',
        exampleOut: 'This will display.'
    })
    public setReturn(context: BBTagContext, forced: boolean): void {
        context.state.return = forced ? RuntimeReturnState.ALL : RuntimeReturnState.CURRENTTAG;
    }
}
