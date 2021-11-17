import { Subtag } from '@cluster/bbtag';
import { randChoose, SubtagType } from '@cluster/utils';

export class RandChooseSubtag extends Subtag {
    public constructor() {
        super({
            name: 'randchoose',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('choices', 'deferred').repeat(2, Infinity)
    ], {
        description: 'Picks one random entry from `choices`',
        exampleCode: 'I feel like eating {randchoose;cake;pie;pudding} today',
        exampleOut: 'I feel like eating pudding today.'
    })
    public async randChooseArg(choices: ReadonlyArray<() => Awaitable<string>>): Promise<string> {
        return await randChoose(choices)();
    }

    // This is here for the case of 1 arg where the value is not an array.
    // This cannot be handled by the `randChooseArg` method because 'deferred' requires
    //   the value to not have been evaluated yet, which it will have been when checking if it is an array.
    // This is fine however, because it also means we have just 1 item to choose from!
    @Subtag.signature('string', [
        Subtag.argument('choice', 'string')
    ], { hidden: true })
    public randChooseSingle(value: string): string {
        return value;
    }

    @Subtag.signature('json', [
        Subtag.argument('choiceArray', 'json[]', { isVariableName: 'maybe' })
    ], {
        description: 'Picks one random entry from `choiceArray`.',
        exampleCode: 'I feel like eating {randchoose;["pie", "cake", "pudding"]} today',
        exampleOut: 'I feel like eating pie today'
    })
    public randChoose(choices: JArray): JToken {
        return randChoose(choices);
    }
}
