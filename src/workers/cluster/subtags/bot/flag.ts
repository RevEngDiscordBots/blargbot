import { BBTagContext, Subtag } from '@cluster/bbtag';
import { guard, SubtagType } from '@cluster/utils';

export class FlagSubtag extends Subtag {
    public constructor() {
        super({
            name: 'flag',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('string?', [
        Subtag.context(),
        Subtag.argument('flagName', 'string')
    ], {
        description: 'Returns the value of the specified case-sensitive flag code. Use `_` to get the values without a flag.',
        exampleCode: '{flag;a} {flag;_}',
        exampleIn: 'Hello, -a world!',
        exampleOut: 'world! Hello,'
    })
    public getFlag(context: BBTagContext, flagName: string): string | undefined {
        if (!guard.isLetter(flagName) && flagName !== '_')
            return undefined;

        return context.flaggedInput[flagName]?.merge().value;
    }
}
