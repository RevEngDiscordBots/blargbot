import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class LbSubtag extends Subtag {
    public constructor() {
        super({
            name: 'lb',
            category: SubtagType.SIMPLE,
            desc: 'Will be replaced by `{` on execution.'
        });
    }

    @Subtag.signature('string', [], {
        description: 'Returns `{`',
        exampleCode: 'This is a bracket! {lb}',
        exampleOut: 'This is a bracket! {'
    })
    public getOpenBrace(): '{' {
        return '{';
    }
}
