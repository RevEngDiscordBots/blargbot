const { Channel } = require.main.require('./Tag/Classes');

class ChannelTypeTag extends Channel {
    constructor(client) {
        super(client, {
            name: 'channeltype',
            args: [
                {
                    name: 'channel',
                    optional: true
                }
            ],
            minArgs: 0, maxArgs: 1
        });
    }

    async execute(ctx, args) {
        const res = await super.execute(ctx, args);
        let channel = ctx.channel;
        if (args[0]) {
            channel = await ctx.client.Helpers.Resolve.channel(args[0].toString(), ctx, true);
        }
        return res.setContent(channel ? channel.type === 0 ? 'text' : 'voice' : '');
    }
}

module.exports = ChannelTypeTag;