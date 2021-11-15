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
        Subtag.argument('origin', 'integer', { ifOmitted: 10, useFallback: true }),
        Subtag.argument('radix', 'integer', { useFallback: true }),
        Subtag.fallback('integer')
    ], {
        description: 'Converts `integer` from a base `origin` number into a base `radix` number. `radix` and `origin` must be between 2 and 36.',
        exampleCode: '{base;FF;16;10}',
        exampleOut: '255'
    })
    public toBase(valueStr: string, origin: number, radix: number, fallback?: number): string {
        if (!between(origin, 2, 36, true)) origin = fallback ?? origin;
        if (!between(radix, 2, 36, true)) radix = fallback ?? radix;

        if (!between(origin, 2, 36, true) || !between(radix, 2, 36, true))
            throw new BBTagRuntimeError('Base must be between 2 and 36');

        const value = parse.int(valueStr, false, origin) ?? fallback;
        if (value === undefined)
            throw new NotANumberError(valueStr);

        return value.toString(radix);
    }
}
