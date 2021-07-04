import { BaseSubtag, SubtagType, parse } from '../core';

export class ParseFloattSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'parsefloat',
            category: SubtagType.COMPLEX,
            aliases: ['absolute'],
            definition: [
                {
                    parameters: ['number'],
                    description: 'Returns an floating point number from `text`. If it wasn\'t a number, returns `NaN`.',
                    exampleCode: '{parsefloat;abcd} {parsefloat;12.34} {parsefloat;1.2cd}',
                    exampleOut: 'NaN 12.34 1.2',
                    execute: (_, [{ value: text }]) => {
                        const float = parse.float(text);
                        if (isNaN(float))
                            return 'NaN';
                        return float.toString();
                    }
                }
            ]
        });
    }
}
