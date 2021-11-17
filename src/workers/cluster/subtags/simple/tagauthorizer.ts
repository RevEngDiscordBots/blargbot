import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class TagAuthorizerSubtag extends Subtag {
    public constructor() {
        super({
            name: 'tagauthorizer',
            aliases: ['ccauthorizer'],
            category: SubtagType.SIMPLE
        });
    }

    @Subtag.signature('string', [
        Subtag.context()
    ], {
        description: 'Returns the user ID of the tag/cc authorizer',
        exampleCode: '{username;{tagauthorizer}} authorized this tag!',
        exampleOut: 'stupid cat authorized this tag!'
    })
    public getAuthorizer(context: BBTagContext): string {
        return context.authorizer;
    }
}
