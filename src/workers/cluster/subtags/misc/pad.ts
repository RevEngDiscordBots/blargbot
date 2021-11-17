import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class PadSubtag extends Subtag {
    public constructor() {
        super({
            name: 'pad',
            category: SubtagType.MISC,
            deprecated: 'realpad'
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('direction', 'string').convert('lowercase').guard(['left', 'right'] as const, 'Invalid direction'),
        Subtag.argument('backing', 'string'),
        Subtag.argument('overlay', 'string')
    ], {
        description: 'Places `text` ontop of `back` with it being aligned to the opposite of `direction`. If `text` is longer than `back` then it will simply overlap',
        exampleCode: '{pad;left;000000;ABC}',
        exampleOut: '000ABC'
    })
    public pad(direction: 'left' | 'right', backing: string, overlay: string): string {
        switch (direction) {
            case 'left': return backing.substr(0, backing.length - overlay.length) + overlay;
            case 'right': return overlay + backing.substr(overlay.length);
        }
    }
}
