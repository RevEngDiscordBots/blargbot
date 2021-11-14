import { BBTagContext, Subtag } from '@cluster/bbtag';
import { guard, SubtagType } from '@cluster/utils';

export class FlagSetSubtag extends Subtag {
    public constructor() {
        super({
            name: 'flagset',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('boolean', [
        Subtag.context(),
        Subtag.argument('flagName', 'string')
    ], {
        description: 'Returns `true` or `false`, depending on whether the specified case-sensitive flag code has been set or not.',
        exampleCode: '{flagset;a} {flagset;_}',
        exampleIn: 'Hello, -a world!',
        exampleOut: 'true false'
    })
    public isFlagSet(context: BBTagContext, flagName: string): boolean {
        if (!guard.isLetter(flagName) && flagName !== '_')
            return false;

        return context.flaggedInput[flagName] !== undefined;
    }
}
