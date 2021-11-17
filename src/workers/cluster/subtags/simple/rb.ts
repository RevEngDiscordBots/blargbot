import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RbSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rb',
            category: SubtagType.SIMPLE
        });
    }

    @Subtag.signature('string', [], {
        description: 'Returns `}`',
        exampleCode: 'This is a bracket! {rb}',
        exampleOut: 'This is a bracket! }'
    })
    public getCloseBrace(): '}' {
        return '}';
    }
}
