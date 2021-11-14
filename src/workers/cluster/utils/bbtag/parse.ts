import { SourceMarker, SourceToken, SourceTokenType, Statement, SubtagCall } from '@cluster/types';

interface MutableSubtagCall extends SubtagCall {
    name: MutableStatement;
    args: MutableStatement[];
    start: SourceMarker;
    end: SourceMarker;
    readonly source: string;
}

interface MutableStatement extends Array<string | MutableSubtagCall> {
    readonly source: string;
    start: SourceMarker;
    end: SourceMarker;
}

export function parseBBTagAST(source: string): Statement {
    const result: MutableStatement = statement(source, { column: 0, index: 0, line: 0 });
    const subtags: MutableSubtagCall[] = [];
    let builder = result;
    let subtag: MutableSubtagCall | undefined;

    for (const token of tokenize(source)) {
        switch (token.type) {
            case SourceTokenType.STARTSUBTAG:
                if (subtag !== undefined)
                    subtags.push(subtag);
                builder.push(subtag = {
                    name: statement(source, token.end),
                    args: [],
                    start: token.start,
                    end: token.end,
                    get source(): string { return source.slice(this.start.index, this.end.index); }
                });
                builder = subtag.name;
                break;
            case SourceTokenType.ARGUMENTDELIMITER:
                if (subtag === undefined)
                    builder.push(token.content);
                else {
                    trim(builder);
                    subtag.args.push(builder = statement(source, token.end));
                }
                break;
            case SourceTokenType.ENDSUBTAG:
                if (subtag === undefined)
                    return statement(source, result.start, token.end, [`\`Unexpected '${token.content}'\``]);
                trim(builder);
                subtag.end = token.end;
                subtag = subtags.pop();
                builder = subtag === undefined ? result : currentBuilder(subtag);
                break;
            case SourceTokenType.CONTENT:
                if (token.content.length === 0)
                    break;
                builder.push(token.content);
                builder.end = token.end;
                break;
        }
    }

    if (subtag !== undefined)
        return statement(source, result.start, result.end, ['`Subtag is missing a \'}\'`']);

    trim(result);
    return result;
}

function* tokenize(source: string): IterableIterator<SourceToken> {
    const marker: Mutable<SourceMarker> = {
        index: 0,
        line: 0,
        column: 0
    };

    let previous = { ...marker };

    function token(type: SourceTokenType, start: SourceMarker, end: SourceMarker): SourceToken {
        return {
            type: type,
            content: source.slice(start.index, end.index),
            start: { ...start },
            end: { ...end }
        };
    }
    function* tokens(type: SourceTokenType): IterableIterator<SourceToken> {
        yield token(SourceTokenType.CONTENT, previous, marker);
        yield token(type, marker, previous = {
            index: marker.index + 1,
            column: marker.column + 1,
            line: marker.line
        });
    }

    for (marker.index = 0; marker.index < source.length; marker.index++, marker.column++) {
        switch (source[marker.index]) {
            case '{':
                yield* tokens(SourceTokenType.STARTSUBTAG);
                break;
            case ';':
                yield* tokens(SourceTokenType.ARGUMENTDELIMITER);
                break;
            case '}':
                yield* tokens(SourceTokenType.ENDSUBTAG);
                break;
            case '\n':
                marker.line++;
                marker.column = -1;
                break;
        }
    }
    yield token(SourceTokenType.CONTENT, previous, marker);
}

function currentBuilder(subtag: MutableSubtagCall): MutableStatement {
    if (subtag.args.length === 0)
        return subtag.name;
    return subtag.args[subtag.args.length - 1];
}

function trim(str: MutableStatement): void {
    modify(str, 0, str => str.trimStart());
    modify(str, str.length - 1, str => str.trimEnd());
}

function modify(str: MutableStatement, index: number, mod: (str: string) => string): void {
    if (str.length === 0)
        return;

    let elem = str[index];
    if (typeof elem !== 'string')
        return;

    elem = mod(elem);
    if (elem.length === 0)
        str.splice(index, 1);
    else
        str[index] = elem;
}

function statement(source: string, start: SourceMarker, end = start, items: Array<MutableStatement[number]> = []): MutableStatement {
    return Object.defineProperties(items, {
        start: { value: start },
        end: { value: end },
        source: {
            get(this: Statement) {
                return source.slice(this.start.index, this.end.index);
            }
        }
    });
}
