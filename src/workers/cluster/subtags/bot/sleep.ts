import { Subtag } from '@cluster/bbtag';
import { sleep, SubtagType } from '@cluster/utils';
import moment, { Duration } from 'moment';

const maxSleep = moment.duration(5, 'minutes');

export class SleepTag extends Subtag {
    public constructor() {
        super({
            name: 'sleep',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.argument('duration', 'duration')
    ], {
        description: 'Pauses the current tag for the specified amount of time. Maximum is 5 minutes',
        exampleCode: '{sleep;10s}{send;{channelid};Hi!}',
        exampleOut: '(After 10s) Hi!'
    })
    public async sleep(duration: Duration): Promise<void> {
        if (duration.asMilliseconds() > maxSleep.asMilliseconds())
            duration = maxSleep;

        await sleep(duration.asMilliseconds());
    }
}
