const { User } = require.main.require('./Tag/Classes');

class UserFullNameTag extends User {
    constructor(client) {
        super(client, {
            name: 'fullname',
            args: [
                {
                    name: 'user',
                    optional: true
                }
            ],
            minArgs: 0, maxArgs: 1
        });
    }

    async execute(ctx, args) {
        const res = await super.execute(ctx, args);
        let user = ctx.user;
        if (args[0]) {
            user = await ctx.client.Helpers.Resolve.user(ctx, args[0].toString(), true);
        }
        return res.setContent(user ? user.fullName : '');
    }
}

module.exports = UserFullNameTag;