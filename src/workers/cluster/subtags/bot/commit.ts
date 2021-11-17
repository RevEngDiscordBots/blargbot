import { BBTagContext, Subtag } from '@cluster/bbtag';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class CommitSubtag extends Subtag {
    public constructor() {
        super({
            name: 'commit',
            category: SubtagType.BOT,
            desc:
                'For optimization reasons, variables are not stored in the database immediately when you use `{set}`. ' +
                'Instead they are cached, and will be saved to the database when the tag finishes. If you have some `variables` that ' +
                'you need to be saved to the database immediately, use this to force an update right now.\nThis comes at a slight ' +
                'performance cost, so use only when needed.\n`variables` defaults to all values accessed up to this point.\n' +
                '`{rollback}` is the counterpart to this.'
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context()
    ], {
        description: 'Commit all variables to the database',
        exampleCode: '{set;var;Hello!}\n{commit}\n{set;var;GoodBye!}\n{rollback}\n{get;var}',
        exampleOut: 'Hello!'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('variableNames', 'string').repeat(1, Infinity)
    ], {
        description: 'Commit provided `variables`',
        exampleCode: '{set;var;Hello!}\n{commit;var}\n{set;var;GoodBye!}\n{rollback;var}\n{get;var}',
        exampleOut: 'Hello!'
    })
    public async commit(
        context: BBTagContext,
        args?: string[]
    ): Promise<void> {
        const values = args === undefined ? undefined : bbtagUtil.tagArray.flattenArray(args)
            .map(value => typeof value === 'object' ? JSON.stringify(value) : value.toString());

        await context.variables.persist(values);
    }
}
