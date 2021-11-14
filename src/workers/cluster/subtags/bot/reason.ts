import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class ReasonSubtag extends Subtag {
    public constructor() {
        super({
            name: 'reason',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('reason', 'string', { ifOmitted: undefined })
    ], {
        description: 'Sets the reason for the next API call (ex. roleadd, roleremove, ban, etc.). If `reason` is empty the reason will be empty',
        exampleCode: '{reason;This will show up in the audit logs!}{roleadd;111111111111}',
        exampleOut: '("This will show up in the audit logs" showed up)'
    })
    public setReason(context: BBTagContext, reason: string | undefined): void {
        context.scopes.local.reason = reason;

    }
}
