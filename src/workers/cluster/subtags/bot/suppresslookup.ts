import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SuppressLookupSubtag extends Subtag {
    public constructor() {
        super({
            name: 'suppresslookup',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('value', 'boolean', { ifOmitted: true })
    ], {
        description: 'Sets whether error messages in the lookup system (query canceled, nothing found) should be suppressed. `value` must be a boolean, and defaults to `true`.',
        exampleCode: '{suppresslookup}',
        exampleOut: ''
    })
    public suppress(context: BBTagContext, value: boolean): void {
        context.scopes.local.noLookupErrors = value;
    }
}
