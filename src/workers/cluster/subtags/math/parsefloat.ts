import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class ParseFloattSubtag extends Subtag {
    public constructor() {
        super({
            name: 'parsefloat',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('number', 'number', { ifInvalid: NaN })
    ], {
        description: 'Returns an floating point number from `text`. If it wasn\'t a number, returns `NaN`.',
        exampleCode: '{parsefloat;abcd} {parsefloat;12.34} {parsefloat;1.2cd}',
        exampleOut: 'NaN 12.34 1.2'
    })
    public parseFloat(number: number): number {
        return number;
    }
}
