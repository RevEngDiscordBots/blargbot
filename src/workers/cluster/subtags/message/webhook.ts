import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { MessageEmbedOptions, WebhookClient } from 'discord.js';

export class WebhookSubtag extends Subtag {
    public constructor() {
        super({
            name: 'webhook',
            category: SubtagType.MESSAGE,
            desc: 'Please assign your webhook credentials to private variables! Do not leave them in your code.\n`embed` can be an array of embed objects.'
        });
    }

    public async executeWebhook(webhookID: string, webhookToken: string): Promise<never>;
    public async executeWebhook(webhookID: string, webhookToken: string, content?: string, embeds?: MessageEmbedOptions[], username?: string, avatar?: string, fileContent?: string, fileName?: string): Promise<void>;
    @Subtag.signature('error', [Subtag.argument('id', 'string'), Subtag.argument('token', 'string')], { hidden: true })
    @Subtag.signature('nothing', [
        Subtag.argument('id', 'string'),
        Subtag.argument('token', 'string'),
        Subtag.argument('content', 'string', { ifOmitted: undefined }),
        Subtag.argument('embed', 'embed[]', { ifOmitted: undefined, allowMalformed: true }),
        Subtag.argument('username', 'string', { ifOmitted: undefined }),
        Subtag.argument('avatarUrl', 'string', { ifOmitted: undefined }),
        Subtag.argument('fileContent', 'string', { ifOmitted: undefined }),
        Subtag.argument('fileName', 'string', { ifOmitted: 'readme.txt' })
    ], {
        description: 'Executes a webhook.\nIf `fileContent` starts with `buffer:`, the following text will be parsed as base64 to a raw buffer.',
        exampleCode: `{webhook;
    1111111111111111;
    t.OK-en;
    Hello world!;
    {j;{"title": "This is my embed!"}};
    CoolUsername;
    https://i.imgur.com/yed5Zfk.gif;
    Hello world from a text file!;
    readme.txt
}`
    })
    public async executeWebhook(
        webhookID: string,
        webhookToken: string,
        content?: string,
        embeds?: MessageEmbedOptions[],
        username?: string,
        avatar?: string,
        fileContent?: string,
        fileName?: string
    ): Promise<void> {
        const fileData = fileContent === undefined ? undefined
            : fileContent.startsWith('buffer:') ? Buffer.from(fileContent.substring(7), 'base64')
                : Buffer.from(fileContent);

        try { //TODO Return the webhook message ID on success
            await new WebhookClient({ id: webhookID, token: webhookToken }).send({
                username: username,
                avatarURL: avatar,
                content: content,
                embeds,
                files: fileData === undefined ? undefined : [
                    { attachment: fileData, name: fileName }
                ]
            });
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new BBTagRuntimeError('Error executing webhook: ' + err.message);
            throw err;
        }
    }
}
