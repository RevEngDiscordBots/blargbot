import { BBTagContext, Subtag } from '@cluster/bbtag';
import { Statement } from '@cluster/types';
import { SubtagType } from '@cluster/utils';
import moment, { Duration } from 'moment-timezone';

export class TimerSubtag extends Subtag {
    public constructor() {
        super({
            name: 'timer',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('code', 'ast'),
        Subtag.argument('duration', 'duration', { guard: duration => duration.asMilliseconds() > 0 })
    ], {
        description: 'Executes `code` after `duration`. Three timers are allowed per custom command, with no recursive timers.',
        exampleCode: '{timer;Hello!;20s}',
        exampleOut: '(after 20 seconds:) Hello!'
    })
    public async queueTimer(context: BBTagContext, code: Statement, duration: Duration): Promise<void> {
        await context.util.cluster.timeouts.insert('tag', {
            version: 4,
            source: context.guild.id,
            user: context.user.id,
            channel: context.channel.id,
            endtime: moment().add(duration).valueOf(),
            context: context.serialize(),
            content: code.source
        });
    }
}
