import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class VoidSubtag extends Subtag {
    public constructor() {
        super({
            name: 'void',
            category: SubtagType.MISC,
            aliases: ['null']
        });
    }

    @Subtag.signature('nothing', [
        Subtag.argument('anything', 'string').noEmit()
    ], {
        description: 'Executes `code` but does not return the output from it. Useful for silent functionality',
        exampleCode: '{void;This won\'t be output!}',
        exampleOut: ''
    })
    public returnNothing(): void {
        /*NOOP*/
    }
}
