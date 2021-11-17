import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class CapitalizeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'capitalize',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('lower', 'boolean', { mode: 'notEmpty' }).ifOmittedUse(false)
    ], {
        description: 'Capitalizes the first letter of `text`. If `lower` is provided, it converts the rest to lowercase.',
        exampleCode: '{capitalize;hELLO WORLD;true}\n{capitalize;hello WORLD;anything goes here}\n{capitalize;foo BAR;}',
        exampleOut: 'Hello world\nHello world\nFoo bar'
    })
    public capitalize(text: string, lowercase: boolean): string {
        const rest = text.slice(1);
        return text[0].toUpperCase() + (lowercase ? rest.toLowerCase() : rest);
    }
}
