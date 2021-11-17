import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class EscapeBbtagSubtag extends Subtag {
    public constructor() {
        super({
            name: 'escapebbtag',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('input', 'source').repeat(0, Infinity)
    ], {
        description: 'Returns `input` without resolving any BBTag' +
            'This effectively returns the characters `{`, `}` and `;` as is, without the use of `{rb}`, `{lb}` and `{semi}`.' +
            '\n**NOTE:** Brackets inside code must come in pairs. A `{` has to be followed by a `}` somewhere and a `} has to have a {` before it',
        exampleCode: '{escapebbtag;{set;~index;1}}',
        exampleOut: '{set;~index;1}'
    })
    public escape(text: string[]): string {
        return text.join(';');
    }
}
