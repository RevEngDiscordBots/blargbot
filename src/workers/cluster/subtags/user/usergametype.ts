import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

const gameTypes = {
    default: '',
    0: 'playing',
    1: 'streaming',
    2: 'listening',
    3: 'watching',
    4: 'custom',
    5: 'competing'
} as const;

export class UserGameTypeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'usergametype',
            category: SubtagType.USER,
            desc: 'Game types can be any of `' + Object.values(gameTypes).filter(type => type).join(', ') + '`'
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('user', 'member', { quietParseError: '' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns how `user` is playing a game. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat is {usergametype;Stupid cat} cats',
        exampleOut: 'Stupid cat is streaming cats'
    })
    public getUserGameType(user: GuildMember): typeof gameTypes[keyof typeof gameTypes] {
        return user.presence?.activities[0]?.type.toLowerCase() ?? '';
    }
}
