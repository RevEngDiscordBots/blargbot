import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SemiSubtag extends Subtag {
    public constructor() {
        super({
            name: 'semi',
            category: SubtagType.SIMPLE
        });
    }

    @Subtag.signature('string', [], {
        description: 'Returns `;`',
        exampleCode: 'This is a semicolon! {semi}',
        exampleOut: 'This is a semicolon! ;'
    })
    public getSemiColon(): ';' {
        return ';';
    }
}
