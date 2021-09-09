import { Cluster } from '@cluster';
import { CustomCommandLimit } from '@cluster/bbtag';
import { ExecutionResult } from '@cluster/types';
import { GuildRolemeEntry } from '@core/types';
import { guard } from '@core/utils';
import { GuildMessage, Message } from 'discord.js';

export class RolemeManager {
    public constructor(
        private readonly cluster: Cluster
    ) {

    }

    public async execute(message: Message): Promise<void> {
        if (!guard.isGuildMessage(message))
            return;

        const rolemes = await this.cluster.database.guilds.getRolemes(message.channel.guild.id);
        for (const roleme of Object.values(rolemes ?? {})) {
            if (roleme === undefined)
                continue;
            if (roleme.channels.length > 0 && !roleme.channels.includes(message.channel.id))
                continue;
            if (message.content !== roleme.message && (roleme.casesensitive || message.content.toLowerCase() !== roleme.message.toLowerCase()))
                continue;

            const roleList = new Set(message.member.roles.cache.keys());
            roleme.add.forEach(r => roleList.add(r));
            roleme.remove.forEach(r => roleList.delete(r));

            try {
                await message.member.edit({ roles: [...roleList] });
                await this.invokeMessage(message, roleme);

            } catch (err: unknown) {
                await this.cluster.util.send(message, 'A roleme was triggered, but I don\'t have the permissions required to give you your role!');
            }
        }
    }

    public async invokeMessage(trigger: GuildMessage, roleme: GuildRolemeEntry): Promise<ExecutionResult> {
        const tag = roleme.output ?? {
            content: 'Your roles have been edited!',
            author: ''
        };

        return await this.cluster.bbtag.execute(tag.content, {
            message: trigger,
            rootTagName: 'roleme',
            limit: new CustomCommandLimit(),
            inputRaw: '',
            isCC: true,
            author: tag.author,
            authorizer: tag.authorizer
        });
    }
}