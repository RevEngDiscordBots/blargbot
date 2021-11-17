import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class NumFormatSubtag extends Subtag {
    public constructor() {
        super({
            name: 'numformat',
            desc: 'If `roundTo` is not provided, but the number does have decimals, rounds to `3` by default. Any precision for decimals will be lost e.g: `100.000000000`becomes `100` and `100.3100000000` becomes `100.31`',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('number', 'number').catch(NaN),
        Subtag.argument('rountTo', 'number').catch(),
        Subtag.argument('decimal', 'string').ifOmittedUse('.'),
        Subtag.argument('thousands', 'string').ifOmittedUse('')
    ], {
        description: 'Rounds `number` to `roundTo` digits. Uses `decimal` as the decimal separator and `thousands` for the thousands separator. To skip `roundTo` or `decimal` leave them empty.',
        exampleCode: '{numformat;3.1415;4;,}\n{numformat;100000;;;.}',
        exampleOut: '3,1415\n100.000'
    })
    public numFormat(number: number, roundTo: number | undefined, decimal: string, thousands: string): string {
        if (isNaN(number))
            return 'NaN';

        const options: LocaleNumOptions = {}; // create formatter options
        if (roundTo !== undefined) {
            roundTo = Math.min(20, Math.max(-21, roundTo));
            const trunclen = Math.trunc(number).toString().length;
            if (roundTo >= 0) {
                options.minimumFractionDigits = roundTo;
                options.maximumFractionDigits = roundTo;
            } else if (trunclen + roundTo >= 0) {
                options.maximumSignificantDigits = trunclen + roundTo;
            }
        }
        const result = number.toLocaleString('en-US', options).split('.');
        result[0] = result[0].split(',').join(thousands);
        return result.join(decimal);
    }
}

interface LocaleNumOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    maximumSignificantDigits?: number;
}
