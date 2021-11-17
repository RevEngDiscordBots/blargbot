import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class TagAuthorSubtag extends Subtag {
    public constructor() {
        super({
            name: 'tagauthor',
            aliases: ['ccauthor'],
            category: SubtagType.SIMPLE
        });
    }

    @Subtag.signature('string', [
        Subtag.context()
    ], {
        description: 'Returns the user ID of the tag/cc author',
        exampleCode: 'This tag was created by {username;{tagauthor}}',
        exampleOut: 'This tag was created by stupid cat'
    })
    public getAuthor(context: BBTagContext): string {
        return context.author;
    }
}
