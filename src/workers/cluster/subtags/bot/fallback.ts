import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class FallBackSubtag extends Subtag {
    public constructor() {
        super({
            name: 'fallback',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('value', 'string').allowOmitted()
    ], {
        description: 'Should any tag fail to parse, it will be replaced with `message` instead of an error.',
        exampleCode: '{fallback;This tag failed} {randint}',
        exampleOut: 'This tag failed'
    })
    public setFallback(context: BBTagContext, value?: string): void {
        context.scopes.local.fallback = value;
    }
}
