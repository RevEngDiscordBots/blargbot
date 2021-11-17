import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SubstringSubtag extends Subtag {
    public constructor() {
        super({
            name: 'substring',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('start', 'number', { useFallback: true }),
        Subtag.argument('end', 'number', { useFallback: true }).allowOmitted()
    ], {
        description: 'Returns all text from `text` between the `start` and `end`.',
        exampleCode: 'Hello {substring;world;2;3}!',
        exampleOut: 'Hello r!'
    })
    public substring(text: string, start: number, end?: number): string {
        return text.slice(start, end);
    }
}
