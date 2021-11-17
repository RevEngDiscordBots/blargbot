import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, UnknownSubtagError } from '@cluster/bbtag/errors';
import { Statement, SubtagCall } from '@cluster/types';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class ApplySubtag extends Subtag {
    public constructor() {
        super({
            name: 'apply',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.subtagAST(),
        Subtag.argument('subtagName', 'string'),
        Subtag.argument('subtagArgs', 'string').repeat(0, Infinity)
    ], {
        description: 'Executes `subtag`, using the `args` as parameters. If `args` is an array, it will get deconstructed to it\'s individual elements.',
        exampleCode: '{apply;randint;[1,4]}',
        exampleOut: '3'
    })
    public async callSubtagWithArgs(context: BBTagContext, subtag: SubtagCall, subtagName: string, args: string[]): Promise<string> {
        subtagName = subtagName.toLowerCase();
        try {
            context.getSubtag(subtagName);
        } catch (error: unknown) {
            if (!(error instanceof UnknownSubtagError))
                throw error;
            throw new BBTagRuntimeError('No subtag found');
        }

        const flattenedArgs = args.flatMap(arg => bbtagUtil.tagArray.deserialize(arg, false) ?? [arg])
            .map(item => typeof item === 'object' ? JSON.stringify(item) : item.toString())
            .map<Statement>(item => Object.assign([item], { source: item, start: subtag.start, end: subtag.end }));

        const applyCall: SubtagCall = {
            name: Object.assign([subtagName], { source: subtagName, start: subtag.start, end: subtag.end }),
            args: flattenedArgs,
            start: subtag.start,
            end: subtag.end,
            get source(): string {
                return `{${args.join(';')}}`;
            }
        };

        return await context.eval(Object.defineProperties([applyCall], {
            start: { value: subtag.start },
            end: { value: subtag.end },
            source: {
                get() {
                    return applyCall.source;
                }
            }
        }));
    }
}
