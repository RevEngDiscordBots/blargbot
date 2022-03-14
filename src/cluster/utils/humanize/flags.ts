import { FlagDefinition } from '@blargbot/cluster/types';

export function flags(flags: readonly FlagDefinition[]): string[] {
    return flags.map(flag => `\`-${flag.flag}\`/\`--${flag.word}\`: ${flag.description}`);
}
