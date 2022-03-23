import { ApiConnection } from '@api';
import { WorkerPoolEventService } from '@core/serviceTypes';
import { ChatlogUser, ExpandedChatlogIndex } from '@core/types';
import { Master } from '@master';

export class ApiGetChatLogsHandler extends WorkerPoolEventService<ApiConnection, 'getChatLogs'> {
    public constructor(private readonly master: Master) {
        super(
            master.api,
            'getChatLogs',
            async ({ data, reply }) => reply(await this.getLogs(data)));
    }

    protected async getLogs(id: string): Promise<ExpandedChatlogIndex | undefined> {
        const logIndex = await this.master.database.chatlogIndex.get(id);
        if (logIndex === undefined) {
            return undefined;
        }

        const messages = await this.master.database.chatlogs.getAll(logIndex.channel, logIndex.ids);
        const userCache = new Map<string, ChatlogUser>();

        for (const message of messages) {
            try {

                if (!userCache.has(message.userid)) {
                    const dbUser = await this.master.database.users.get(message.userid);
                    if (dbUser !== undefined) {
                        userCache.set(dbUser.userid, {
                            id: dbUser.userid,
                            username: dbUser.username,
                            discriminator: dbUser.discriminator,
                            avatarURL: dbUser.avatarURL
                        });
                    } else {
                        const user = await this.master.discord.users.fetch(message.userid);
                        userCache.set(message.userid, {
                            id: user.id,
                            username: user.username,
                            discriminator: user.discriminator,
                            avatarURL: user.avatarURL() ?? undefined
                        });

                    }
                }
            } catch {
                userCache.set(message.userid, {
                    id: message.userid,
                    username: 'unknown',
                    discriminator: '0000'
                });
            }
        }

        const expandedLogs: ExpandedChatlogIndex = {
            ...logIndex,
            messages: [...messages],
            parsedUsers: Object.fromEntries(userCache.entries())
        };

        return expandedLogs;
    }
}
