import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class UnindentSubtag extends Subtag {
    public constructor() {
        super({
            name: 'unindent',
            aliases: ['ui'],
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('level', 'integer').allowOmitted().catch()
    ], {
        description: 'Unindents text (or code!). If no level is provided, attempts to guess the indentation level past the first line.',
        exampleCode: '```\n{unindent;\n  hello\n  world\n}\n```',
        exampleOut: '```\nhello\nworld\n```'
    })
    public unindent(text: string, level?: number): string {
        if (level === undefined) {
            const lines = text.split('\n').slice(1);
            level = lines.length === 0 ? 0 : Math.min(...lines.map(l => l.length - l.replace(/^ +/, '').length));
        }

        if (level === 0)
            return text;

        const regexp = new RegExp(`^ {1,${level}}`, 'gm');
        return text.replace(regexp, '');
    }
}
