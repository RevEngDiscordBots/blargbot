import { BaseSubtag, SubtagType, BBTagContext, SubtagCall, parse } from '../core';

export class RandStrSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'randstr',
            category: SubtagType.COMPLEX,
            aliases: ['absolute'],
            definition: [
                {
                    parameters: ['chars', 'length'],
                    description: 'Creates a random string with characters from `chars` that is `length` characters long.',
                    exampleCode: '{randstr;abcdefghijklmnopqrstuvwxyz;9}',
                    exampleOut: 'kgzyqcvda',
                    execute: (ctx, [{ value: charsStr }, { value: countStr }], subtag) => this.randStr(ctx, charsStr, countStr, subtag)
                }
            ]
        });
    }

    public randStr(
        context: BBTagContext,
        charsStr: string,
        countStr: string,
        subtag: SubtagCall
    ): string {
        const chars = charsStr.split(''),
            fallback = parse.int(context.scope.fallback ?? '');
        let count = parse.int(countStr);

        if (isNaN(count)) count = fallback;
        if (isNaN(count)) return this.notANumber(context, subtag, 'Count and fallback are not numbers');

        if (chars.length === 0) return this.customError('Not enough characters', context, subtag);

        const numberArray = [...Array(count).keys()];
        return numberArray.map(_ => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
}
