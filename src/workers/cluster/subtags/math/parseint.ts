import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class ParseIntSubtag extends Subtag {
    public constructor() {
        super({
            name: 'parseint',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('number', 'integer').catch(NaN)
    ], {
        description: 'Returns an integer from `text`. If it wasn\'t a number, returns `NaN`.',
        exampleCode: '{parseint;abcd} {parseint;1234} {parseint;12cd}',
        exampleOut: 'NaN 1234 12'
    })
    public parseInt(number: number): number {
        return number;
    }
}
