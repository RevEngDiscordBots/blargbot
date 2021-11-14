import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class IsArraySubtag extends Subtag {
    public constructor() {
        super({
            name: 'isarray',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('boolean', [
        Subtag.parameter('text', 'json[]', { default: undefined })
    ], {
        description: 'Determines whether `text` is a valid array.',
        exampleCode: '{isarray;["array?"]} {isarray;array?}',
        exampleOut: 'true false'
    })
    public isArray(array: JArray | undefined): boolean {
        return array !== undefined;
    }
}
