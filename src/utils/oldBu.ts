import moment from 'moment';
import avatars from '../../res/avatars.json';
import config from '../../config.json';
import { EventEmitter } from 'eventemitter3';
import ReadWriteLock from 'rwlock';
import { Client as DiscordClient, GuildTextableChannel, Message, Constants, User, Member, DiscordRESTError, DiscordHTTPError, Guild, EmbedField, EmbedOptions, Permission, GuildAuditLogEntry, EmbedAuthorOptions, AnyChannel } from 'eris';
import { fafo, getRange, humanize, randInt, SubtagVariableType } from '.';
import isSafeRegex from 'safe-regex';
import request from 'request';
import { parse } from './utils';
import snekfetch from 'snekfetch';
import limax from 'limax';
import { nfkd } from 'unorm';
import { Engine as BBEngine, limits, RuntimeContext as BBContext, SubtagCall } from '../core/bbtag';
import { ClusterUtilities } from '../cluster';
import { StoredGuild, StoredTag } from '../core/database';

interface dbquery {
    type: string;
    scope: string;
    name: string;
    content?: string;
}

type bot = DiscordClient & {
    models: {
        BBTagVariable: {
            upsert(query: dbquery): Promise<void>;
            findOne(filter: { where: dbquery }): Promise<{
                get(key: string): JToken;
            }>;
        };
    };
    database: {
        sequelize: {
            transaction(): Promise<{
                commit(): Promise<void>;
            }>;
        };
    };
};

const TagLock = Symbol('The key for a ReadWriteLock');
interface TagLocks {
    [key: string]: TagLocks
    [TagLock]?: ReadWriteLock;
}

const console: CatLogger = <CatLogger><unknown>undefined;
const bot = <bot><unknown>undefined;
const bbEngine: BBEngine = <BBEngine><unknown>undefined;
const cluster = <NodeJS.Process & Required<Pick<NodeJS.Process, 'send'>>><unknown>process;
const util = <ClusterUtilities><unknown>undefined;
let awaitReactionCounter = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const oldBu = {
    commandMessages: {},
    notCommandMessages: {},
    bans: {} as Record<string, Record<string, { mod: User, type: string, reason: string }>>,
    unbans: {},
    globalVars: {},
    commandStats: {},
    commandUses: 0,
    cleverbotStats: 0,
    messageStats: 0,
    awaitMessages: {} as Record<string, Record<string, string[]>>,
    awaitReactions: {} as Record<string, Record<string, string[]>>,
    tagLocks: {} as TagLocks,
    stats: {} as Record<string, unknown>,
    cleverStats: {},
    startTime: moment(),
    avatars: avatars,//JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'res', `avatars${config.general.isbeta ? '2' : ''}.json`), 'utf8'));
    emitter: new EventEmitter(),
    events: new EventEmitter(),
    settings: {
        makelogs: {
            name: 'Make Chatlogs',
            desc: 'Whether to record chat logs or not.',
            type: 'bool'
        },
        cahnsfw: {
            name: 'Is CAH NSFW',
            desc: 'Whether \'cah\' can only be done in nsfw channels or not.',
            type: 'bool'
        },
        deletenotif: {
            name: 'Delete Notifications',
            desc: 'If enabled, notifies you if a user deleted their command.',
            type: 'bool'
        },
        greeting: {
            name: 'Greeting Message',
            desc: 'What to say to new users when they join. You can also use the <code>greet</code> command',
            type: 'string'
        },
        farewell: {
            name: 'Farewell Message',
            desc: 'What to say when a user leaves. You can also use the <code>farewell</code> command',
            type: 'string'
        },
        modlog: {
            name: 'Modlog Channel',
            desc: 'The id of the modlog channel. You can also use the <code>modlog</code> command',
            type: 'string'
        },
        mutedrole: {
            name: 'Muted Role',
            desc: 'The id of the muted role.',
            type: 'string'
        },
        tableflip: {
            name: 'Tableflips',
            desc: 'Whether the bot should respond to tableflips/unflips.',
            type: 'bool'
        },
        antimention: {
            name: 'Anti-Mention',
            desc: 'The number of unique mentions required to warrant a ban (for anti-mention spam). Set to \'0\' to disable. Recommended: 25',
            type: 'int'
        },
        dmhelp: {
            name: 'DM Help',
            desc: 'Whether or not to dm help messages or output them in channels',
            type: 'bool'
        },
        permoverride: {
            name: 'Permission Override',
            desc: 'Whether or not specific permissions override role requirement',
            type: 'bool'
        },
        staffperms: {
            name: 'Staff Permissions',
            desc: 'The numeric value of permissions that designate a staff member. If a user has any of the permissions and permoverride is enabled, allows them to execute any command regardless of role. See <a href=https://discordapi.com/permissions.html>here</a> for a permission calculator.',
            type: 'int'
        },
        kickoverride: {
            name: 'Kick Override',
            desc: 'Same as staffperms, but allows users to use the kick command regardless of permissions',
            type: 'int'
        },
        banoverride: {
            name: 'Ban Override',
            desc: 'Same as staffperms, but allows users to use the ban/hackban/unban commands regardless of permissions',
            type: 'int'
        },
        banat: {
            name: 'Ban At',
            desc: 'The number of warnings before a ban. Set to 0 or below to disable.',
            type: 'int'
        },
        kickat: {
            name: 'Kick At',
            desc: 'The number of warnings before a kick. Set to 0 or below to disable.',
            type: 'int'
        },
        adminrole: {
            name: 'Admin Role Name',
            desc: 'The name of the Admin role.',
            type: 'string'
        },
        nocleverbot: {
            name: 'No Cleverbot',
            desc: 'Disables cleverbot functionality',
            type: 'bool'
        },
        disableeveryone: {
            name: 'Disable Everyone Pings',
            desc: 'Disables everyone pings in custom commands.',
            type: 'bool'
        },
        disablenoperms: {
            name: 'Disable No Perms',
            desc: 'Disables the \'You need the role to use this command\' message.',
            type: 'bool'
        },
        social: {
            name: 'Enable Social Commands',
            desc: 'Enables social commands.',
            type: 'bool'
        }
    },
    CAT_ID: config.discord.users.owner,
    avatarColours: [
        0x2df952,
        0x2df9eb,
        0x2d6ef9,
        0x852df9,
        0xf92dd3,
        0xf92d3b,
        0xf9b82d,
        0xa0f92d
    ],
    defaultStaff: Constants.Permissions.kickMembers +
        Constants.Permissions.banMembers +
        Constants.Permissions.administrator +
        Constants.Permissions.manageChannels +
        Constants.Permissions.manageGuild +
        Constants.Permissions.manageMessages,
    ModLogColour: {
        BAN: 0xcc0c1c,
        UNBAN: 0x79add1,
        SOFTBAN: 0xffee02,
        KICK: 0xdb7b1c,
        UNMUTE: 0x1cdb68,
        MUTE: 0xd80f66,
        WARN: 0xd1be79,
        PARDON: 0x79d196
    },
    tagVariableScopes: [
        {
            name: 'Server',
            prefix: '_',
            description: 'Server variables (also referred to as Guild variables) are commonly used if you wish to store data on a per server level. ' +
                'They are however stored in 2 separate \'pools\', one for tags and one for custom commands, meaning they cannot be used to pass data between the two\n' +
                'This makes then very useful for communicating data between tags that are intended to be used within 1 server at a time.',
            setter: async (context: BBContext, _subtag: SubtagCall | null, values: Record<string, JToken>): Promise<void> =>
                await oldBu.setVariable(context.guild.id, values,
                    context.isCC && !context.tagVars ? SubtagVariableType.GUILD : SubtagVariableType.TAGGUILD),
            getter: async (context: BBContext, _subtag: SubtagCall | null, name: string): Promise<JToken> =>
                await oldBu.getVariable(context.guild.id, name,
                    context.isCC && !context.tagVars ? SubtagVariableType.GUILD : SubtagVariableType.TAGGUILD),
            getLock: (context: BBContext, _subtag: SubtagCall | null, key: string): ReadWriteLock => oldBu.getLock(...['SERVER', context.isCC ? 'CC' : 'Tag', key])
        },
        {
            name: 'Author',
            prefix: '@',
            description: 'Author variables are stored against the author of the tag, meaning that only tags made by you can access or edit your author variables.\n' +
                'These are very useful when you have a set of tags that are designed to be used by people between servers, effectively allowing servers to communicate with eachother.',
            setter: async (context: BBContext, subtag: SubtagCall | null, values: Record<string, JToken>): Promise<void> => {
                if (context.author)
                    return await oldBu.setVariable(context.author, values, SubtagVariableType.AUTHOR);
                context.addError(subtag, 'No author found');
            },
            getter: async (context: BBContext, subtag: SubtagCall | null, name: string): Promise<JToken> => {
                if (context.author)
                    return await oldBu.getVariable(context.author, name, SubtagVariableType.AUTHOR);
                return context.addError(subtag, 'No author found');
            },
            getLock: (context: BBContext, _subtag: SubtagCall | null, key: string): ReadWriteLock => oldBu.getLock(...['AUTHOR', context.author, key])
        },
        {
            name: 'Global',
            prefix: '*',
            description: 'Global variables are completely public, anyone can read **OR EDIT** your global variables.\n' +
                'These are very useful if you like pain.',
            setter: async (_context: BBContext, _subtag: SubtagCall | null, values: Record<string, JToken>): Promise<void> =>
                await oldBu.setVariable(undefined, values, SubtagVariableType.GLOBAL),
            getter: async (_context: BBContext, _subtag: SubtagCall | null, name: string): Promise<JToken> =>
                await oldBu.getVariable(undefined, name, SubtagVariableType.GLOBAL),
            getLock: (_context: BBContext, _subtag: SubtagCall | null, key: string): ReadWriteLock => oldBu.getLock(...['GLOBAL', key])
        },
        {
            name: 'Temporary',
            prefix: '~',
            description: 'Temporary variables are never stored to the database, meaning they are by far the fastest variable type.\n' +
                'If you are working with data which you only need to store for later use within the same tag call, then you should use temporary variables over any other type',
            setter: (_context: BBContext, _subtag: SubtagCall | null, _values: Record<string, JToken>): Promise<void> => Promise.resolve(), //Temporary is never persisted to the database
            getter: (_context: BBContext, _subtag: SubtagCall | null, _name: string): Promise<JToken> => Promise.resolve(undefined), //Temporary is never persisted to the database
            getLock: (context: BBContext, _subtag: SubtagCall | null, key: string): ReadWriteLock => context.getLock(key)
        },
        {
            name: 'Local',
            prefix: '',
            description: 'Local variables are the default variable type, only usable if your variable name doesnt start with one of the other prefixes. ' +
                'These variables are only accessible by the tag that created them, meaning there is no possibility to share the values with any other tag.\n' +
                'These are useful if you are intending to create a single tag which is usable anywhere, as the variables are not confined to a single server, just a single tag',
            setter: async (context: BBContext, _subtag: SubtagCall | null, values: Record<string, JToken>): Promise<void> => {
                if (context.isCC && !context.tagVars)
                    return await oldBu.setVariable(context.tagName, values, SubtagVariableType.GUILDLOCAL, context.guild.id);
                return await oldBu.setVariable(context.tagName, values, SubtagVariableType.LOCAL);
            },
            getter: async (context: BBContext, _subtag: SubtagCall | null, name: string): Promise<JToken> => {
                if (context.isCC && !context.tagVars)
                    return await oldBu.getVariable(context.tagName, name, SubtagVariableType.GUILDLOCAL, context.guild.id);
                return await oldBu.getVariable(context.tagName, name, SubtagVariableType.LOCAL);
            },
            getLock: (context: BBContext, _subtag: SubtagCall | null, key: string): ReadWriteLock => oldBu.getLock(...['LOCAL', context.isCC ? 'CC' : 'TAG', key])
        }
    ],
    async handleCensor(msg: Message<GuildTextableChannel>, storedGuild: StoredGuild): Promise<void> {
        const censor = storedGuild.censor;
        if (censor?.list.length) {
            //First, let's check exceptions
            const exceptions = censor.exception;
            if (!(exceptions.channel.includes(msg.channel.id) ||
                exceptions.user.includes(msg.author.id) ||
                (exceptions.role.length > 0 && oldBu.hasRole(msg, exceptions.role)))) { // doesn't have an exception!
                for (const cens of censor.list) {
                    let violation = false;
                    const term = cens.term;
                    if (cens.regex) {
                        try {
                            const regex = oldBu.createRegExp(term);
                            if (regex.test(msg.content)) violation = true;
                        } catch (err) { }
                    } else if (msg.content.toLowerCase().indexOf(term.toLowerCase()) > -1) violation = true;
                    if (violation == true) { // Uh oh, they did a bad!
                        const res = await util.moderation.issueWarning(msg.author, msg.channel.guild, cens.weight);
                        if (cens.weight > 0) {
                            await util.moderation.logAction(msg.channel.guild, msg.author, bot.user, 'Auto-Warning', cens.reason || 'Said a blacklisted phrase.', oldBu.ModLogColour.WARN, [{
                                name: 'Warnings',
                                value: `Assigned: ${cens.weight}\nNew Total: ${res.count || 0}`,
                                inline: true
                            }]);
                        }
                        try {
                            await msg.delete();
                        } catch (err) {
                            // bu.send(msg, `${bu.getFullName(msg.author)} said a blacklisted word, but I was not able to delete it.`);
                        }
                        let content = '';
                        switch (res.type) {
                            case 0:
                                if (cens.deleteMessage) content = cens.deleteMessage;
                                else if (censor.rule.deleteMessage) content = censor.rule.deleteMessage;
                                else content = '';
                                break;
                            case 1:
                                if (cens.banMessage) content = cens.banMessage;
                                else if (censor.rule.banMessage) content = censor.rule.banMessage;
                                else content = '';
                                break;
                            case 2:
                                if (cens.kickMessage) content = cens.kickMessage;
                                else if (censor.rule.kickMessage) content = censor.rule.kickMessage;
                                else content = '';
                                break;
                        }
                        await bbEngine.execute(content, {
                            message: msg,
                            limit: new limits.CustomCommandLimit(),
                            input: parse.words(msg.content),
                            isCC: true,
                            tagName: 'censor'
                        });
                    }
                }
            }
        }
    },
    isNsfwChannel(channelid: string): boolean {
        const channel = bot.getChannel(channelid);
        if ('nsfw' in channel)
            return channel.nsfw;
        return false;
    },
    async isBlacklistedChannel(channelid: string): Promise<boolean> {
        const guildid = bot.channelGuildMap[channelid];
        if (!guildid) {
            //console.warn('Couldn\'t find a guild that corresponds with channel ' + channelid + ' - isBlacklistedChannel');
            return false;
        }
        const guild = await util.database.guilds.get(guildid);

        return guild?.channels[channelid]?.blacklisted ?? false;
    },
    compareStats(a: StoredTag, b: StoredTag): -1 | 0 | 1 {
        if (a.uses < b.uses)
            return -1;
        if (a.uses > b.uses)
            return 1;
        return 0;
    },
    async awaitReact(
        messages: string | string[],
        users: string | string[],
        reactions?: string[],
        check?: (message: Message<GuildTextableChannel>, user: User, reaction: string) => Promise<boolean> | boolean,
        timeout?: number
    ): Promise<{ message: Message<GuildTextableChannel>, channel: GuildTextableChannel, user: User, emoji: string }> {
        if (!Array.isArray(messages))
            messages = [messages];
        if (!Array.isArray(users))
            users = [users];
        if (reactions) {
            if (!Array.isArray(reactions))
                reactions = [reactions];
            reactions = reactions.map(r => r.replace(/[<>]/g, ''));
        }
        const _check = check ?? (() => true);
        const _timeout = timeout ?? 300000;

        const eventName = `await_reaction_${awaitReactionCounter++}`;
        const eventReferences: string[][] = [];

        for (const message of messages) {
            const msg = oldBu.awaitReactions[message] || (oldBu.awaitReactions[message] = {});
            for (const user of users) {
                const usr = msg[user] || (msg[user] = []);
                usr.push(eventName);
                eventReferences.push(usr);
            }
        }

        oldBu.emitter.removeAllListeners(eventName);

        console.debug(`awaiting reaction | messages: [${messages}] users: [${users}] reactions: ${JSON.stringify(reactions)} timeout: ${_timeout}`);

        const watchFor = reactions ? reactions.map(r => {
            const match = SANITIZED.exec(r);
            if (match)
                return match[1];
            else return r;
        }) : null;

        return await new Promise<{ message: Message<GuildTextableChannel>, channel: GuildTextableChannel, user: User, emoji: string }>((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new TimeoutError(_timeout)), _timeout);

            oldBu.emitter.on(eventName, fafo(async (message: Message<GuildTextableChannel>, emoji: string, user: User) => {
                let sanitized = emoji;
                const match = SANITIZED.exec(sanitized);
                if (match)
                    sanitized = match[1];

                console.log('Received reaction event:', eventName, sanitized, watchFor);
                try {
                    if (watchFor && !watchFor.includes(sanitized))
                        return;
                    if (await _check(message, user, emoji)) {
                        clearTimeout(timeoutId);
                        resolve({ message, channel: message.channel, user, emoji });
                    }
                } catch (err) {
                    clearTimeout(timeoutId);
                    reject(err);
                }
            }));
        }).finally(function () {
            oldBu.emitter.removeAllListeners(eventName);
            for (const ref of eventReferences) {
                const index = ref.indexOf(eventName);
                if (index != -1) {
                    ref.splice(index, 1);
                }
            }
        });
    },
    async hasPerm(
        msg: Message<GuildTextableChannel> | Member,
        perm: string | string[],
        quiet = false,
        override = true
    ): Promise<boolean> {
        const member = msg instanceof Member ? msg : msg.member;
        if (!member)
            return false;

        if (override && ((member.id === oldBu.CAT_ID) ||
            member.guild.ownerID == member.id ||
            member.permissions.json.administrator)) {
            return true;
        }

        const roles = member.guild.roles.filter(m => {
            if (Array.isArray(perm) ?
                perm.map(q => q.toLowerCase()).indexOf(m.name.toLowerCase()) > -1 :
                m.name.toLowerCase() == perm.toLowerCase()) {
                return true;
            } else {
                const roles = [];

                if (Array.isArray(perm)) {
                    for (let i = 0; i < perm.length; i++) {
                        const id = getId(perm[i]);
                        if (id !== null)
                            roles.push(id);
                    }
                } else {
                    roles.push(getId(perm));
                }
                return roles.includes(m.id);
            }
        });
        for (let i = 0; i < roles.length; i++) {
            if (member.roles.indexOf(roles[i].id) > -1) {
                return true;
            }
        }
        if (!quiet && 'content' in msg) {
            const guild = await util.database.guilds.get(member.guild.id);
            if (!guild?.settings.disablenoperms) {
                const permString = Array.isArray(perm) ? perm.map(m => '`' + m + '`').join(', or ') : '`' + perm + '`';
                void util.send(msg, `You need the role ${permString} in order to use this command!`);
            }
        }
        return false;
    },
    hasRole(
        msg: Message<GuildTextableChannel> | Member,
        roles: string | string[],
        override = true
    ): boolean {
        const member = msg instanceof Member ? msg : msg.member;
        if (!member)
            return false;

        if (override && ((member.id === oldBu.CAT_ID) ||
            member.guild.ownerID == member.id ||
            member.permissions.json.administrator)) {
            return true;
        }
        if (!Array.isArray(roles)) roles = [roles];
        for (let i = 0; i < roles.length; i++) {
            if (member.roles.indexOf(roles[i]) > -1) {
                return true;
            }
        }
        return false;
    },
    async addReactions(
        channelId: string,
        messageId: string,
        reactions: string[]
    ): Promise<Record<number, { error: unknown, reactions: string[] }>> {
        const errors = {} as Record<number, { error: unknown, reactions: string[] }>;
        for (const reaction of new Set(reactions || [])) {
            try {
                await bot.addMessageReaction(channelId, messageId, reaction);
            } catch (e) {
                if (e instanceof DiscordHTTPError || e instanceof DiscordRESTError) {
                    if (!errors[e.code])
                        errors[e.code] = { error: e, reactions: [] };
                    switch (e.code) {
                        case 50013:
                            errors[e.code].reactions.push(...new Set(reactions));
                            return errors;
                        default:
                            errors[e.code].reactions.push(reaction);
                            break;
                    }
                } else {
                    throw e;
                }
            }
        }

        return errors;
    },

    async canDmErrors(userId: string): Promise<boolean> {
        const storedUser = await util.database.users.get(userId, true);
        return !storedUser?.dontdmerrors;
    },
    async getUserById(userId: string): Promise<User | null> {
        const match = /\d{17,21}/.exec(userId);
        if (match) {
            const user = bot.users.get(match[0]);
            if (user) {
                return user;
            } else {
                try {
                    return await bot.getRESTUser(match[0]);
                } catch (err) { return null; }
            }
        }
        return null;
    },
    async getMessage(channelId: string, messageId: string): Promise<Message | null> {
        if (/^\d{17,23}$/.test(messageId)) {
            const channel = bot.getChannel(channelId);
            if ('messages' in channel) {
                const messageAttempt = channel.messages.get(messageId);
                if (messageAttempt)
                    return messageAttempt;
            }
            try {
                return await bot.getMessage(channelId, messageId);
            } catch (e) { }
        }
        return null;
    },
    saveConfig(): void {
        oldBu.emitter.emit('saveConfig');
    },
    reloadUserList(): void {
        oldBu.emitter.emit('ircUserList');
    },
    getMemoryUsage(): number {
        const memory = process.memoryUsage();
        return memory.rss / 1024 / 1024;
    },
    comparePerms(m: Member, allow: number): boolean {
        if (!allow) allow = oldBu.defaultStaff;
        const newPerm = new Permission(allow, 0);
        for (const key in newPerm.json) {
            if (m.permissions.has(key)) {
                return true;
            }
        }
        return false;
    },
    shuffle(array: unknown[]): void {
        let i = 0,
            j = 0,
            temp = null;

        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    },
    padLeft(value: string, length: number): string {
        return (value.toString().length < length) ? oldBu.padLeft(' ' + value, length) : value;
    },
    padRight(value: string, length: number): string {
        return (value.toString().length < length) ? oldBu.padRight(value + ' ', length) : value;
    },
    async logEvent(
        guildid: string,
        userids: string | string[],
        event: string,
        fields: EmbedField[],
        embed: EmbedOptions
    ): Promise<void> {
        const storedGuild = await util.database.guilds.get(guildid);
        if (!storedGuild) throw new Error('Cannot find guild');
        const log = storedGuild.log ?? {};
        const logIgnore = storedGuild.logIgnore ?? [];
        if (!Array.isArray(userids)) userids = [userids];
        // If there are not any userId's that are not contained in the ignore, then return
        // I.e. if all the users are contained in the ignore list
        if (!userids.find(id => !logIgnore.includes(id)))
            return;
        event = event.toLowerCase();

        let roleAdd = false;
        if (event.startsWith('role:')) {
            const c = event.split(':');
            // const roleId = c[1];
            roleAdd = c[2] === 'add';
            event = c.slice(0, 2).join(':');
        }

        if (event in log) {
            let color;
            let eventName;
            switch (event) {
                case 'messagedelete':
                    color = 0xaf1d1d;
                    eventName = 'Message Deleted';
                    break;
                case 'messageupdate':
                    color = 0x771daf;
                    eventName = 'Message Updated';
                    break;
                case 'nameupdate':
                    color = 0xd8af1a;
                    eventName = 'Username Updated';
                    break;
                case 'avatarupdate':
                    color = 0xd8af1a;
                    eventName = 'Avatar Updated';
                    break;
                case 'nickupdate':
                    color = 0xd8af1a;
                    eventName = 'Nickname Updated';
                    break;
                case 'memberjoin':
                    color = 0x1ad8bc;
                    eventName = 'User Joined';
                    break;
                case 'memberleave':
                    color = 0xd8761a;
                    eventName = 'User Left';
                    break;
                case 'memberunban':
                    color = 0x17c914;
                    eventName = 'User Was Unbanned';
                    break;
                case 'memberban':
                    color = 0xcc0c1c;
                    eventName = 'User Was Banned';
                    break;
                case 'kick':
                    color = 0xe8b022;
                    eventName = 'User Was Kicked';
                default:
                    if (event.startsWith('role:')) {
                        eventName = `Special Role ${roleAdd ? 'Added' : 'Removed'}`;
                    }
                    break;
            }
            const channel = log[event];
            if (!embed) embed = {};
            embed.title = `ℹ ${eventName}`;
            embed.timestamp = new Date();
            embed.fields = fields;
            embed.color = color;
            try {
                await util.send(channel, { embed });
            } catch (err) {
                await util.database.guilds.setLogChannel(guildid, event, undefined);
                await util.send(guildid, `Disabled event \`${event}\` because either output channel doesn't exist, or I don't have permission to post messages in it.`);
            }
        }
    },
    async getAudit(guildId: string, targetId: string, type?: number): Promise<GuildAuditLogEntry | null> {
        try {
            const al = await bot.getGuildAuditLogs(guildId, 50, undefined, type);
            for (const e of al.entries) {
                if (e.targetID === targetId) {
                    return e;
                }
            }
            return null;
        } catch (err) {
            // may not have audit log perms
            return null;
        }
    },
    async filterMentions(message: string, guild: Guild): Promise<string> {
        let match: RegExpExecArray | null;
        while (match = /<@!?([0-9]{17,21})>/.exec(message)) {
            const id = match[1];
            try {
                const user = bot.users.get(id) || await bot.getRESTUser(id);
                message = message.replace(new RegExp(`<@!?${id}>`), humanize.fullName(user));
            } catch (err) {
                message = message.replace(new RegExp(`<@!?${id}>`), `<@\u200b${id}>`);
            }
        }
        while (match = /<#([0-9]{17,21})>/.exec(message)) {
            const id = match[1];
            const channel = bot.getChannel(id);
            if (channel && 'name' in channel) {
                message = message.replace(new RegExp(`<#${id}>`), `#${channel.name}`);
            } else {
                message = message.replace(new RegExp(`<#${id}>`), `<#\u200b${id}>`);
            }
        }
        if (guild)
            while (match = /<@&([0-9]{17,21})>/.exec(message)) {
                const id = match[1];
                const role = guild.roles.get(id);
                if (role) {
                    message = message.replace(new RegExp(`<@&${id}>`), `${role.name}`);
                } else {
                    message = message.replace(new RegExp(`<@&${id}>`), `<@&\u200b${id}>`);
                }
            }
        return message;
    },
    getPerms(channelid: string): Permission['json'] | null {
        const channel = bot.getChannel(channelid);
        if (channel && 'guild' in channel) {
            const permission = channel.permissionsOf(bot.user.id);
            return permission.json;
        } else {
            return null;
        }
    },
    genToken(length: number): string {
        if (!length)
            length = 7;
        let output = '';
        for (let i = 0; i < length; i++) {
            output += tokenChoices[randInt(0, tokenChoices.length - 1)];
        }
        return output;
    },
    awaitEvent(obj: Record<string, unknown>): Promise<unknown> {
        return new Promise((fulfill, reject) => {
            cluster.send(obj);
            oldBu.emitter.once(<string>obj.code, fulfill);

            setTimeout(() => {
                reject('Timed out after 60 seconds');
            }, 60000);
        });
    },
    genEventCode(): string {
        let code = oldBu.genToken(15);
        while (oldBu.emitter.listeners(code, true)) {
            code = oldBu.genToken(15);
        }
        return code;
    },
    getAuthor(user: User): EmbedAuthorOptions {
        return {
            name: humanize.fullName(user),
            url: `https://blargbot.xyz/user/${user.id}`,
            icon_url: user.avatarURL
        };
    },
    createRegExp(term: string): RegExp {
        if (term.length > 2000)
            throw new Error('Regex too long');
        const regexList = /^\/?(.*)\/(.*)/.exec(term);
        if (regexList) {
            const temp = new RegExp(regexList[1], regexList[2]);
            if (!isSafeRegex(temp)) {
                throw new Error('Unsafe Regex');
            }
            return temp;
        }
        throw new Error('Invalid Regex');
    },
    postStats(): void {
        // updateStats();
        const stats = {
            server_count: bot.guilds.size,
            shard_count: config.shards.max,
            shard_id: parseInt(<string>process.env.CLUSTER_ID)
        };
        // bot.executeWebhook('511922345099919360', config.shards.shardToken, {
        //     content: JSON.stringify(stats)
        // });
        console.log(stats);
        request.post({
            'url': `https://discord.bots.gg/api/v1/bots/${bot.user.id}/stats`,
            'headers': {
                'content-type': 'application/json',
                'Authorization': config.general.botlisttoken,
                'User-Agent': 'blargbot/1.0 (ratismal)'
            },
            'json': true,
            body: stats
        }, (err) => {
            if (err) console.error(err);
        });

        if (!config.general.isbeta) {
            console.info('Posting to matt');

            request.post({
                'url': 'https://www.carbonitex.net/discord/data/botdata.php',
                'headers': {
                    'content-type': 'application/json'
                },
                'json': true,
                body: {
                    'key': config.general.carbontoken,
                    'servercount': stats.server_count,
                    shard_count: stats.shard_count,
                    shard_id: stats.shard_id,
                    'logoid': bot.user.avatar
                }
            }, (err) => {
                if (err) console.error(err);
            });

            const shards = [];
            for (const shardId of bot.shards.map(s => s.id)) {
                shards[shardId] = bot.guilds.filter(g => g.shard.id === shardId);
            }
            request.post({
                url: `https://discordbots.org/api/bots/${bot.user.id}/stats`,
                json: true,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': config.general.botlistorgtoken,
                    'User-Agent': 'blargbot/1.0 (ratismal)'
                },
                body: {
                    shards
                }
            }, err => {
                if (err) console.error(err);
            });
        }
    },
    fixContent(content: string): string {
        const tempContent = content.split('\n');
        for (let i = 0; i < tempContent.length; i++) {
            tempContent[i] = tempContent[i].trim();
        }
        return tempContent.join('\n');
    },
    between(value: number, lower: number, upper: number, inclusive: boolean): boolean {
        if (lower > upper)
            lower = [upper, upper = lower][0];

        if (inclusive)
            return value >= lower && value <= upper;
        return value > lower && value < upper;
    },
    isBoolean(value: unknown): value is boolean {
        return typeof value == 'boolean';
    },
    parseChannel(text: string, allowJustId = false): AnyChannel | null {
        const id = parse.entityId(text, '#', allowJustId);
        if (id == null) return null;
        return bot.getChannel(id);
    },
    groupBy<T, K extends string | number | symbol>(values: IterableIterator<T>, selector: (value: T) => K): Array<T[] & { key: K }> {
        const groups: Partial<Record<K, T[] & { key: K }>> = {};
        const keys = new Set<K>();
        for (const value of values) {
            const key = selector(value);
            let group = groups[key];
            if (group == undefined) {
                keys.add(key);
                group = groups[key] = <T[] & { key: K }><unknown>[];
                group.key = key;
            }
            group.push(value);
        }

        return [...keys]
            .map(k => groups[k])
            .filter((i): i is T[] & { key: K } => i !== undefined);
    },

    compare(left: string, right: string): number {
        const a = oldBu.toBlocks('' + left);
        const b = oldBu.toBlocks('' + right);

        const pairs = [];
        const max = Math.max(a.length, b.length);
        for (let i = 0; i < max; i++)
            pairs.push([a[i], b[i]]);

        let result = 0;

        for (const pair of pairs) {
            //If they are already identical, no need to keep checking.
            if (pair[0] == pair[1]) continue;
            if (typeof pair[0] == 'number') result -= 1;
            if (typeof pair[1] == 'number') result += 1;
            if (result) return result; //Only one of them is a number

            if (pair[0] > pair[1]) return 1;
            if (pair[0] < pair[1]) return -1;

            //They are not equal, they are not bigger or smaller than eachother.
            //They are strings or numbers. Only NaN satisfies this condition
            if (isNaN(<number>pair[0])) result -= 1;
            if (isNaN(<number>pair[1])) result += 1;
            if (result) return result;

            //They are both NaN, so continue checking
        }

        //All pairs are identical
        return 0;
    },
    toBlocks(text: string): Array<string | number> {
        const regex = /[-+]?\d+(?:\.\d*)?(?:e\+?\d+)?/g;
        const numbers = text.match(regex) || [];
        const words = text.split(regex);

        const result = [];
        const max = Math.max(numbers.length, words.length);
        for (let i = 0; i < max; i++) {
            if (words[i] !== undefined) result.push(words[i]);
            if (numbers[i] !== undefined) result.push(parseFloat(numbers[i]));
        }
        return result;
    },
    // eslint-disable-next-line @typescript-eslint/ban-types
    async blargbotApi(endpoint: string, args: string | Buffer | object = {}): Promise<Buffer | string | object | null> {
        try {
            const res = await snekfetch.post(config.blargbot_api.base + endpoint)
                .set({ Authorization: config.blargbot_api.token })
                .send(args);
            return res.body;
        } catch (err) {
            console.error(err);
            return null;
        }
    },
    decancer(text: string): string {
        text = nfkd(text);
        text = limax(text, {
            replacement: ' ',
            tone: false,
            separateNumbers: false,
            maintainCase: true,
            custom: ['.', ',', ' ', '!', '\'', '"', '?']
        });
        return text;
    },

    async findMessages(channelId: string, count: number, filter: (m: Message) => boolean, before?: string, after?: string): Promise<Message[]> {
        const result = [];
        filter = filter || (() => true);

        while (result.length < count) {
            const batchSize = Math.min(100, count - result.length);
            const batch = await bot.getMessages(channelId, batchSize, before, after);
            result.push(...batch);

            if (batch.length != batchSize)
                break;

            before = result[result.length - 1].id;
        }

        return result.filter(filter);
    },
    formatAuditReason(user: User, reason: string, ban = false): string {
        let fullReason = humanize.fullName(user);
        if (reason) {
            fullReason += `: ${reason}`;
        }
        // bans use their own system and cannot be uriencoded. thanks discord!
        return !ban ? encodeURIComponent(fullReason) : fullReason;
    },
    serializeTagArray(array: JArray, varName: string): string {
        if (!varName)
            return JSON.stringify(array);

        const obj = {
            v: array,
            n: varName
        };
        return JSON.stringify(obj);
    },
    deserializeTagArray(value: string): { v: JArray, n: string } | null {
        let parsed;
        try {
            parsed = JSON.parse(value);
        }
        catch (err) { }
        if (!parsed) {
            try {
                const replaced = value.replace(/([\[,]\s*)(\d+)\s*\.\.\.\s*(\d+)(\s*[\],])/gi,
                    (_, before, from, to, after) => `${before}${getRange(from, to).join(',')}${after}`);
                parsed = JSON.parse(replaced);
            }
            catch (err) { }
        }
        if (Array.isArray(parsed)) {
            parsed = {
                v: parsed
            };
        }
        if (!parsed || !Array.isArray(parsed.v) || (parsed.n !== undefined && typeof parsed.n != 'string'))
            parsed = null;
        if (parsed) {
            return {
                n: parsed.n,
                v: parsed.v
            };
        }
        return null;
    },
    async getArray(context: BBContext, subtag: SubtagCall, arrName: string): Promise<{ v: JArray, n: string } | undefined> {
        const obj = oldBu.deserializeTagArray(arrName);
        if (obj != null)
            return obj;
        try {
            const arr = await context.variables.get(subtag, arrName);
            if (arr !== undefined && Array.isArray(arr))
                return { v: arr, n: arrName };
        } catch (err) { }
        return undefined;
    },
    async setVariable(scope: string | undefined, values: Record<string, JToken>, type: SubtagVariableType, guildId?: string): Promise<void> {
        const trans = await bot.database.sequelize.transaction();
        for (const key in values) {
            const query = getQuery(scope, key, type, guildId);
            let val = values[key];
            val = JSON.stringify(val);
            query.content = val;
            try {
                await bot.models.BBTagVariable.upsert(query);
            } catch (err) {
                console.error(err);
                if (err.errors) {
                    for (const e of err.errors)
                        console.error(e.path, e.validatorKey, e.value);
                }
                console.info(query);
            }
        }
        return await trans.commit();
    },

    async getVariable(scope: string | undefined, key: string, type: SubtagVariableType, guildId?: string): Promise<JToken> {
        const query = getQuery(scope, key, type, guildId);

        const v = await bot.models.BBTagVariable.findOne({
            where: query
        });
        if (v) {
            let result = v.get('content');
            // try parsing to a json value
            if (typeof result === 'string') {
                try {
                    result = JSON.parse(result);
                } catch (err) { /* no-op */ }
            }

            return result;
        }
        else return null;
    },

    getLock(...path: string[]): ReadWriteLock {
        let node = oldBu.tagLocks || (oldBu.tagLocks = {});

        for (const entry of path)
            node = node[entry] || (node[entry] = {});

        return node[TagLock] || (node[TagLock] = new ReadWriteLock());
    }
};

function getQuery(
    name: string | undefined,
    key: string,
    type: SubtagVariableType,
    guildId: string | undefined
): dbquery {
    const query: Partial<dbquery> = {
        name: key.substring(0, 255)
    };

    switch (type) {
        case SubtagVariableType.GUILD:
            query.type = 'GUILD_CC';
            query.scope = name;
            break;
        case SubtagVariableType.GUILDLOCAL:
            query.type = 'LOCAL_CC';
            query.scope = `${guildId}_${name}`;
            break;
        case SubtagVariableType.TAGGUILD:
            query.type = 'GUILD_TAG';
            query.scope = name;
            break;
        case SubtagVariableType.AUTHOR:
            query.type = 'AUTHOR';
            query.scope = name;
            break;
        case SubtagVariableType.LOCAL:
            query.type = 'LOCAL_TAG';
            query.scope = name;
            break;
        case SubtagVariableType.GLOBAL:
            query.type = 'GLOBAL';
            query.scope = '';
            break;
    }
    if (query.scope === null) {
        query.scope = '';
        console.info(type, key, name, guildId);
    }
    if (typeof query.scope === 'string')
        query.scope = query.scope.substring(0, 255);
    return <dbquery>query;
}

class TimeoutError extends Error {
    public constructor(
        public readonly timeout: number
    ) {
        super('Action timed out');
    }
}


function getId(text: string): string | null {
    const match = /[0-9]{17,23}/.exec(text);
    return match?.[1] ?? null;
}

const SANITIZED = /(\w+:\d+)/;

const tokenChoices = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';