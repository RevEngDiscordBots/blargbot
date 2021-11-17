import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { parse, SubtagType } from '@cluster/utils';

export class TimeSubtag extends Subtag {
    public constructor() {
        super({
            name: 'time',
            category: SubtagType.MISC,
            desc: 'If you provide `time`, you should also provide `parseFormat` to ensure it is being interpreted correctly.\n' +
                'See the [moment documentation](http://momentjs.com/docs/#/displaying/format/) for more format information.\n' +
                'See [here](http://momentjs.com/docs/#/parsing/) for parsing documentation. ' +
                'See [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for a list of timezone codes.'
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('format', 'string').ifOmittedUse('YYYY-MM-DDTHH:mm:ssZ'),
        Subtag.argument('time', 'string').ifOmittedUse('now'),
        Subtag.argument('parseFormat', 'string').ifOmittedUse(''),
        Subtag.argument('fromTimezone', 'string').ifOmittedUse('Etc/UTC'),
        Subtag.argument('toTimezone', 'string').ifOmittedUse('Etc/UTC')
    ], {
        description: '`time` is in `fromTimezone` and converted to `toTimezone` using `format`.',
        exampleCode: 'Current date & time in UTC: {time}\n' +
            'Current time in Berlin: {time;HH:mm;;;;Europe/Berlin}\n' +
            'UTC 12:00 in Berlin: {time;HH:mm;12:00;HH:mm;;Europe/Berlin}\n' +
            '12:00 in Berlin to UTC: {time;HH:mm;12:00;HH:mm;Europe/Berlin}\n' +
            '12:00 in Berlin to New York time: {time;HH:mm;12:00;HH:mm;Europe/Berlin;America/New_York}',
        exampleOut: 'Current date & time in UTC: 2021-11-17T14:30:12Z\n' +
            'Current time in Berlin: 15:30\n' +
            'UTC 12:00 in Berlin: 13:00\n' +
            '12:00 in Berlin to UTC: 11:00\n' +
            '12:00 in Berlin to New York time: 06:00'
    })
    public changeTimezone(outputFormat: string, timestampStr: string, inputFormat: string, inputTimezone: string, outputTimezone: string): string {
        const timestamp = parse.time(timestampStr, inputFormat, inputTimezone);
        if (!timestamp.isValid())
            throw new BBTagRuntimeError('Invalid date');

        return timestamp.tz(outputTimezone).format(outputFormat);
    }
}
