import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class CommentSubtag extends Subtag {
    public constructor() {
        super({
            name: 'comment',
            aliases: ['//'],
            category: SubtagType.MISC,
            desc: 'A subtag that just gets removed. Useful for documenting your code.'
        });
    }

    @Subtag.signature('nothing', [
        Subtag.argument('anything', 'string').repeat(0, Infinity).noEmit()
    ], {
        exampleCode: 'This is a sentence. {//;This is a comment.}',
        exampleOut: 'This is a sentence.'
    })
    public doNothing(): void {
        /*NOOP*/
    }
}
