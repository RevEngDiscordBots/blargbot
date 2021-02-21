"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsCommand = void 0;
const command_1 = require("../core/command");
const utils_1 = require("../utils");
class SettingsCommand extends command_1.BaseCommand {
    constructor(cluster) {
        super(cluster, {
            name: 'settings',
            category: utils_1.CommandType.ADMIN,
            info: 'Gets or sets the settings for the current guild. Visit https://blargbot.xyz/commands/settings for key documentation.',
            handler: {
                parameters: '',
                execute: message => this.all(message),
                description: 'Gets the current settings for this guild',
                subcommands: {
                    'keys': {
                        parameters: '',
                        description: 'Lists all the setting keys and their types',
                        execute: () => this.keys()
                    },
                    'set': {
                        parameters: '{key} {value*}',
                        description: 'Sets the given setting key to have a certian value. If `value` is omitted, the setting is reverted to its default value',
                        execute: (message, [setting, ...values]) => this.set(message, setting, values.join(' '))
                    }
                }
            }
        });
    }
    async all(message) {
        if (!utils_1.guard.isGuildMessage(message))
            return 'Settings are only available in a guild';
        const storedGuild = await this.database.guilds.get(message.channel.guild.id);
        if (!storedGuild)
            return 'Your guild is not correctly configured yet! Please try again later';
        const settings = storedGuild.settings;
        const channels = storedGuild.channels;
        const nsfw = [];
        const blacklisted = [];
        let i;
        for (const channel in channels) {
            if (channels[channel]?.nsfw)
                nsfw.push(channel);
            if (channels[channel]?.blacklisted)
                blacklisted.push(channel);
        }
        let prefix = settings.prefix ?
            settings.prefix : 'Not Set';
        if (Array.isArray(prefix))
            prefix = prefix[0];
        let nsfwMessage = 'None Set';
        if (nsfw.length > 0) {
            nsfwMessage = '';
            for (i = 0; i < nsfw.length; i++) {
                const channel = this.discord.getChannel(nsfw[i]);
                if (channel)
                    nsfwMessage += `${utils_1.humanize.channelName(channel)} (${nsfw[i]})\n                - `;
            }
            nsfwMessage = nsfwMessage.substring(0, nsfwMessage.length - 19);
        }
        let blacklistMessage = 'None Set';
        if (blacklisted.length > 0) {
            blacklistMessage = '';
            for (i = 0; i < blacklisted.length; i++) {
                const channel = this.discord.getChannel(blacklisted[i]);
                if (channel)
                    blacklistMessage += `${utils_1.humanize.channelName(channel)} (${blacklisted[i]})\n                - `;
            }
            blacklistMessage = blacklistMessage.substring(0, blacklistMessage.length - 19);
        }
        let greeting = settings.greeting ?
            settings.greeting : 'Not Set';
        if (greeting.length > 100)
            greeting = greeting.substring(0, 100) + '...';
        let farewell = settings.farewell ?
            settings.farewell : 'Not Set';
        if (farewell.length > 100)
            farewell = farewell.substring(0, 100) + '...';
        let modlogChannel;
        if (settings.modlog) {
            const channel = this.discord.getChannel(settings.modlog);
            if (channel)
                modlogChannel = `${utils_1.humanize.channelName(channel)} (${settings.modlog})`;
            else
                modlogChannel = `Channel Not Found (${settings.modlog})`;
        }
        else {
            modlogChannel = 'Not Set';
        }
        const deleteNotif = utils_1.parse.boolean(settings.deletenotif, false, true);
        // const cahNsfw = settings.cahnsfw && settings.cahnsfw != 0 ? true : false;
        const mutedRole = settings.mutedrole ? await this.util.getRole(message, settings.mutedrole, { suppress: true }) : null;
        const tableFlip = utils_1.parse.boolean(settings.tableflip, false, true);
        let parsedAntiMention;
        if (settings.antimention) {
            parsedAntiMention = utils_1.parse.int(settings.antimention).toString();
            if (parsedAntiMention == '0' || parsedAntiMention === 'NaN') {
                parsedAntiMention = 'Disabled';
            }
        }
        else {
            parsedAntiMention = 'Disabled';
        }
        const antiMention = parsedAntiMention;
        const permOverride = utils_1.parse.boolean(settings.permoverride, false, true);
        const dmHelp = utils_1.parse.boolean(settings.dmhelp, false, true);
        const makeLogs = utils_1.parse.boolean(settings.makelogs, false, true);
        const staffPerms = settings.staffperms || utils_1.defaultStaff;
        const kickPerms = settings.kickoverride || 0;
        const banPerms = settings.banoverride || 0;
        const disableEveryone = settings.disableeveryone || false;
        const disableNoPerms = settings.disablenoperms || false;
        const greetChan = settings.greetChan ? this.discord.getChannel(settings.greetChan) ?? undefined : undefined;
        const farewellChan = settings.farewellchan ? this.discord.getChannel(settings.farewellchan) ?? undefined : undefined;
        const cleverbot = settings.nocleverbot || false;
        const kickAt = settings.kickat || 'Disabled';
        const banAt = settings.banat || 'Disabled';
        const social = settings.social || 'Disabled';
        const adminRoleName = settings.adminrole || 'Admin';
        return {
            embed: {
                fields: [
                    {
                        name: 'General',
                        value: `\`\`\`
          Prefix : ${prefix}
         DM Help : ${dmHelp}
Disable No Perms : ${disableNoPerms}
 Social Commands : ${social}
\`\`\``
                    },
                    {
                        name: 'Messages',
                        value: `\`\`\`
         Greeting : ${greeting}
         Farewell : ${farewell}
       Tableflips : ${tableFlip}
        Cleverbot : ${!cleverbot}
Disable @everyone : ${disableEveryone}
\`\`\``
                    },
                    {
                        name: 'Channels',
                        value: `\`\`\`
Farewell Channel : ${farewellChan ? utils_1.humanize.channelName(farewellChan) : 'Default Channel'}
Greeting Channel : ${greetChan ? utils_1.humanize.channelName(greetChan) : 'Default Channel'}
   NSFW Channels : ${nsfwMessage}
  Modlog Channel : ${modlogChannel}
     Blacklisted : ${blacklistMessage}
\`\`\``
                    },
                    {
                        name: 'Permissions',
                        value: `\`\`\`
Perm Override : ${permOverride}
  Staff Perms : ${staffPerms}
Kick Override : ${kickPerms}
 Ban Override : ${banPerms}
\`\`\``
                    },
                    {
                        name: 'Warnings',
                        value: `\`\`\`
Kick At : ${kickAt}
 Ban At : ${banAt}
\`\`\``
                    },
                    {
                        name: 'Moderation',
                        value: `\`\`\`
      Chat Logs : ${makeLogs}
   Anti-Mention : ${antiMention}
     Muted Role : ${mutedRole ? `${mutedRole.name} (${mutedRole.id})` : 'Not Set'}
  Track Deletes : ${deleteNotif}
Admin Role Name : ${adminRoleName}
\`\`\``
                    }
                ]
            }
        };
    }
    async set(message, setting, value) {
        if (!utils_1.guard.isGuildMessage(message))
            return 'Settings are only available in a guild';
        const key = setting.toLowerCase();
        if (!utils_1.guard.isGuildSetting(key))
            return 'Invalid key!';
        const parsed = await utils_1.parse.guildSetting(message, this.util, key, value);
        if (!parsed.success)
            return `'${value}' is not a ${utils_1.guildSettings[key]?.type}`;
        if (!await this.database.guilds.setSetting(message.channel.guild.id, key, parsed.value))
            return 'Failed to set';
        return ':ok_hand:';
    }
    keys() {
        let message = '\nYou can use \`settings set <key> [value]\` to set the following settings. All settings are case insensitive.\n';
        for (const key in utils_1.guildSettings) {
            if (utils_1.guard.isGuildSetting(key))
                message += ` - **${key.toUpperCase()}** (${utils_1.guildSettings[key]?.type})\n`;
        }
        return message;
    }
}
exports.SettingsCommand = SettingsCommand;
//# sourceMappingURL=settings.js.map