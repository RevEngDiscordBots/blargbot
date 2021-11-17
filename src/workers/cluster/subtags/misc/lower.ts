import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class LowerSubtag extends Subtag {
    public constructor() {
        super({
            name: 'lower',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string')
    ], {
        description: 'Returns `text` as lowercase.',
        exampleCode: '{lower;THIS WILL BECOME LOWERCASE}',
        exampleOut: 'this will become lowercase'
    })
    public lowercase(value: string): string {
        return value.toLowerCase();
    }
}
