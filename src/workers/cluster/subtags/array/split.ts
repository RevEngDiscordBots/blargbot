import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SplitSubtag extends Subtag {
    public constructor() {
        super({
            name: 'split',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('string[]', [
        Subtag.parameter('text', 'string'),
        Subtag.parameter('splitter', 'string')
    ], {
        description: 'Splits `text` using `splitter`, and the returns an array.',
        exampleCode: '{split;Hello! This is a sentence.;{space}}',
        exampleOut: '["Hello!","This","is","a","sentence."]'
    })
    public split(text: string, splitter: string): string[] {
        return text.split(splitter);
    }
}
