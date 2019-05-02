// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

const Discord = require("discord.js");

module.exports = async (client, r, unbClient, userCooldowns, globalCooldowns, authReq, message) => {
    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) {
        // If the author is MEE6 announcing level 5, add shards
        await checkMEE6ShardMessage(client, unbClient, message);
        // Otherwise ignore other bots
        return;
    }

    // Grab the settings for this server from Enmap.
    // If there is no guild, get default conf (DMs)
    const settings = message.settings = client.getSettings(message.guild.id);

    // Checks if the bot was mentioned, with no message after it, returns the prefix.
    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention)) {
        return message.reply(`My prefix on this guild is \`${settings.prefix}\``);
    }

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if (message.content.indexOf(settings.prefix) !== 0)
        return;

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // If the member on a guild is invisible or not cached, fetch them.
    if (message.guild && !message.member)
        await message.guild.fetchMember(message.author);

    // Get the user or member's permission level from the elevation
    const level = client.permlevel(message);
    const channelPermLevel = client.channelPerm(message);

    // Check whether the command, or alias, exist in the collections defined
    // in app.js.
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    // using this const varName = thing OR otherthign; is a pretty efficient
    // and clean way to grab one of 2 values!
    if (!cmd)
        return;

    // Some commands may not be useable in DMs. This check prevents those commands from running
    // and return a friendly error message.
    if (cmd && !message.guild && cmd.conf.guildOnly)
        return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

    if (level < client.levelCache[cmd.conf.permLevel]) {
        if (settings.systemNotice === "true") {
            return message.channel.send(`You do not have permission to use this command.
  Your permission level is ${level} (${client.config.permLevels.find(l => l.level === level).name})
  This command requires level ${client.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
        } else {
            return;
        }
    }

    if (channelPermLevel < client.channelPermLevelCache[cmd.conf.channelPerms]) {
        if (settings.systemNotice === "true") {
            return message.channel.send(`This command is disabled in this channel.`);
        } else {
            return;
        }
    }

    // To simplify message arguments, the author's level is now put on level (not member so it is supported in DMs)
    // The "level" command module argument will be deprecated in the future.
    message.author.permLevel = level;

    message.flags = [];
    while (args[0] && args[0][0] === "-") {
        message.flags.push(args.shift().slice(1));
    }

    // Command specific cooldown
    if (cmd.conf.userCooldown) {
        if (!userCooldowns.has(command)) {
            userCooldowns.set(command, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = userCooldowns.get(command);
        const cooldownAmount = (cmd.conf.cooldownDuration) * 1000; // * 1000 because of ms

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command}\` command.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (cmd.conf.globalCooldown) {
        const now = Date.now();
        const cooldownAmount = (cmd.conf.cooldownDuration) * 1000;

        if (!globalCooldowns.has(command)) {
            globalCooldowns.set(command, now);
        } else {
            const timestamp = globalCooldowns.get(command);
            const expirationTime = timestamp + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command}\` command.`);
            }
        }

        setTimeout(() => globalCooldowns.delete(command), cooldownAmount);
    }

    // In case it's an authentication request, store the message info in a collection so that we can retrieve it later
    if (cmd.help.name === 'auth') {
        authReq.set(message.author.id, message);

        // The maximum duration for a temporary OAuth2 bearer token is 1 hour
        setTimeout(() => authReq.delete(message.author.id), 60 * 60 * 1000);
    }

    // If the command exists, **AND** the user has permission, run it.
    client.logger.cmd(`[CMD] ${client.config.permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`);
    cmd.run(client, message, args, level, r, unbClient);
};

async function checkMEE6ShardMessage(client, unbClient, message) {
    if (message.author.id === client.config.shards.mee6ID) {
        if (message.channel.id === client.config.shards.shardTriggerChannelID) {
            const regex = /level 5 ?!/; // level 5! or level 5 !
            if (message.content.match(regex)) {
                const member = message.mentions.members.first();
                if (!member) {
                    message.channel.send(`Congratulations on reaching the 5th level! Unfortunately, I cannot parse your mention. ${message.guild.owner} should give you 1000 shards now and fix the MEE6 message so that it contains the {user} mention.\n\nMore info on shards:**https://www.reddit.com/r/flairwars/wiki/shards`);
                    return;
                }
                await message.channel.send("Congratulations on reaching the 5th level! You are now eligible for **shards** - a virtual currency which you can trade with other users. You will get 1000 shards - spend them well.\n\n**More info on shards:**https://www.reddit.com/r/flairwars/wiki/shards");
                await unbClient.editUserBalance(message.guild.id, member.user.id, { cash: 1000 }, "Reached level 5");
            }
        }
    }
}