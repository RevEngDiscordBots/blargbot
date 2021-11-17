import { Subtag } from '@cluster/bbtag';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';

export interface SwitchCase<T> {
    readonly value: string;
    readonly body: () => Awaitable<T>;
}

export class SwitchSubtag extends Subtag {
    public constructor() {
        super({
            name: 'switch',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string?', [
        Subtag.argument('value', 'string'),
        Subtag.argumentGroup([
            Subtag.argument('case', 'string'),
            Subtag.argument('then', 'deferred')
        ]).repeat(0, Infinity).convert(cases => cases.map(c => ({ value: c.case, body: c.then }))),
        Subtag.argument('default', 'deferred').allowOmitted()
    ], {
        description: 'Compares `value` against each of the `case`s and executes the corresponding `then`. If a `case` is an array, each of its elements will be checked instead.\n' +
            'If no `case` matches, then the `default` will be run.',
        exampleCode: '{switch;1;\n  0;You said 0!;\n  [1,2,3];You said 1, 2 or 3!;\n  4;You said 4!;\n  I cant count that high...\n}',
        exampleOut: 'You said 1, 2 or 3!'
    })
    public async switch<T>(value: string, cases: ReadonlyArray<SwitchCase<T>>, defaultCase?: () => Awaitable<T>): Promise<T | undefined> {
        for (const _case of cases) {
            const options = bbtagUtil.tagArray.deserialize(_case.value, false) ?? [_case.value];
            for (const option of options)
                if (parse.string(option) === value)
                    return await _case.body();
        }
        return await defaultCase?.();
    }
}
