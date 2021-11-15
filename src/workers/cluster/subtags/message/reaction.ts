import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class ReactionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'reaction',
            category: SubtagType.MESSAGE
        });
    }

    @Subtag.signature('string', [
        Subtag.context()
    ], {
        description: 'Gets the reaction that triggered {waitreact}',
        exampleCode: '{waitreact;11111111111111111;{bool;{reaction};==;✅}}',
        exampleOut: '["111111111111111","12345678912345","3333333333333","✅"]'
    })
    public getReaction(context: BBTagContext): string {
        const val = context.scopes.local.reaction;
        if (val === undefined)
            throw new BBTagRuntimeError('{reactuser} can only be used inside {waitreaction}');
        return val;
    }
}
