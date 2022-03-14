import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { SubtagType } from '@blargbot/cluster/utils';

export class TagAuthorSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'tagauthor',
            category: SubtagType.SIMPLE,
            aliases: ['ccauthor'],
            definition: [
                {
                    parameters: [],
                    description: 'Returns the user ID of the tag/cc author',
                    exampleCode: 'This tag was created by {username;{tagauthor}}',
                    exampleOut: 'This tag was created by stupid cat',
                    returns: 'id',
                    execute: (ctx) => this.getAuthor(ctx)
                }
            ]
        });
    }

    public getAuthor(context: BBTagContext): string {
        return context.authorId;
    }
}