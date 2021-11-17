import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';
import moment from 'moment';

export class GuildCreateDat extends Subtag {
    public constructor() {
        super({
            name: 'guildcreatedat',
            category: SubtagType.GUILD
        });
    }

    @Subtag.signature('string', [
        Subtag.guild(),
        Subtag.argument('format', 'string').allowOmitted()
    ], {
        description: 'Returns the date the current guild was created, in UTC+0. If a `format` code is specified, the date is ' +
            'formatted accordingly. Leave blank for default formatting. See the [moment documentation](http://momentjs.com/docs/#/displaying/format/) for more information.',
        exampleCode: 'This guild was created on {guildcreatedat;YYYY/MM/DD HH:mm:ss}',
        exampleOut: 'This guild was created on 2016/01/01 01:00:00'
    })
    public getGuildCreatedDate(guild: Guild, format?: string): string {
        return moment(guild.createdAt).utcOffset(0).format(format);
    }
}
