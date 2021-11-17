import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SpaceSubtag extends Subtag {
    public constructor() {
        super({
            name: 'space',
            aliases: ['s'],
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('count', 'number', { useFallback: true }).ifOmittedUse(1)
    ], {
        description: 'Will be replaced by `count` spaces. If `count` is less than `0`, no spaces will be returned.',
        exampleCode: 'Hello,{space;4}world!',
        exampleOut: 'Hello,    world!'
    })
    public getSpaces(count: number): string {
        // TODO: limit count
        return ''.padStart(count < 0 ? 0 : count, ' ');
    }
}
