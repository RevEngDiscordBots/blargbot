import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, NotANumberError } from '@cluster/bbtag/errors';
import { between, parse, SubtagType } from '@cluster/utils';

export class BaseNumberSubtag extends Subtag {
    public constructor() {
        super({
            name: 'base',
            aliases: ['radix'],
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('integer', 'string'),
        Subtag.useValue(10),
        Subtag.argument('radix', 'integer', { useFallback: true, max: 36, min: 2, rangeError: 'Base must be between 2 and 36' })
    ], {
        description: 'Converts `integer` from a base 10 number into a base `radix` number.',
        exampleCode: '{base;FF;16;10}',
        exampleOut: '255'
    })
    @Subtag.signature('string', [
        Subtag.argument('integer', 'string'),
        Subtag.argument('origin', 'integer', { useFallback: true, max: 36, min: 2, rangeError: 'Base must be between 2 and 36' }).ifOmittedUse(10),
        Subtag.argument('radix', 'integer', { useFallback: true, max: 36, min: 2, rangeError: 'Base must be between 2 and 36' })
    ], {
        description: 'Converts `integer` from a base `origin` number into a base `radix` number.',
        exampleCode: '{base;FF;16;10}',
        exampleOut: '255'
    })
    public toBase(valueStr: string, origin: number, radix: number): string {
        if (!between(origin, 2, 36, true) || !between(radix, 2, 36, true))
            throw new BBTagRuntimeError('Base must be between 2 and 36');

        const value = parse.int(valueStr, false, origin);
        if (value === undefined)
            throw new NotANumberError(valueStr);

        return value.toString(radix);
    }
}
