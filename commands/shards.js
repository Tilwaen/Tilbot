const { Client } = require('unb-api');
const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args, level, r) => {
    const colours = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];
    const colourRoles = colours.map(colour => message.guild.roles.find(role => role.name === colour));
    var colourBalance = new Map();
    const adminRoleID = message.guild.roles.find(role => role.name.toLowerCase() === client.config.defaultSettings.adminRole).id;

    const guildID = message.guild.id;

    const unbClient = new Client(client.config.unbApiToken);
    var msg = await message.channel.send("Fetching data...");
    // User[]; user.user_id, user.cash
    const leaderboard = await unbClient.getGuildLeaderboard(guildID);

    msg = await msg.edit("Processing data");

    var usersGone = [];
    var usersModerators = [];
    var usersNotColoured = [];

    for (var user of leaderboard) {
        // Skip people with zero cash
        if (user.cash === 0) continue;
        const member = message.guild.members.get(user.user_id);

        // People that are not on the server anymore
        if (!member) {
            usersGone.push({ userID: user.user_id, cash: user.cash });
            continue;
        }

        // Moderators
        if (member.roles.has(adminRoleID)) {
            usersModerators.push({ user: member.user.tag, cash: user.cash });
        // People that don't have a colour role
        } else if (!member.roles.some(role => colourRoles.includes(role))) {
            usersNotColoured.push({ user: member.user.tag, cash: user.cash });
        // Coloured users
        } else {
            colourRoles.forEach(colourRole => {
                if (member.roles.has(colourRole.id)) {
                    const previousBalance = colourBalance.get(colourRole.name) ? colourBalance.get(colourRole.name) : 0;
                    colourBalance.set(colourRole.name, previousBalance + user.cash);
                }
            });
        }
    }

    var colourTotal = 0;
    var colourString = "";

    // Sort the map by value
    colourBalance = new Map([...colourBalance.entries()].sort((a, b) => b[1] - a[1]));

    for (let [k, v] of colourBalance) {
        colourString = `${colourString}**${k}:** ${v}\n`;
        colourTotal = (v === "Infinity") ? "Infinity" : colourTotal + v;
    }

    var stringUsersGone = "";
    var stringModerators = "";
    var stringNotColoured = "";
    var usersGoneBalance = 0;
    var moderatorsBalance = 0;
    var notColouredBalance = 0;

    // Append additional text
    if (usersGone.length > 0) {
        for (var user of usersGone) {
            if (usersGoneBalance === "Infinity" || user.cash === "Infinity") {
                usersGoneBalance = "Infinity";
            }
            stringUsersGone = `${stringUsersGone}${user.userID}: ${user.cash}\n`;
        }
    }
    if (usersModerators.length > 0) {
        for (var user of usersModerators) {
            if (moderatorsBalance === "Infinity" || user.cash === "Infinity") {
                moderatorsBalance = "Infinity";
            }
            stringModerators = `${stringModerators}${user.user}: ${user.cash}\n`;
        }
    }
    if (usersNotColoured.length > 0) {
        for (var user of usersNotColoured) {
            if (notColouredBalance === "Infinity" || user.cash === "Infinity") {
                notColouredBalance = "Infinity";
            }
            stringNotColoured = `${stringNotColoured}${user.user}: ${user.cash}\n`;
        }
    }
    const balance = [colourTotal, usersGoneBalance, moderatorsBalance, notColouredBalance];
    const total = balance.includes("Infinity") ? "Infinity" : balance.reduce((a, v) => a + v);

    sendEmbed(msg, colourString, colourTotal, total, stringUsersGone, stringModerators, stringNotColoured);
};

async function sendEmbed(msg, colourString, colourTotal, total, usersGone, mods, uncoloured) {
    var embed = new RichEmbed()
        .setColor(0xC9DDFF)
        .addField("Shard count", colourString)
        .addField("Colour net worth:", colourTotal)
        .addField("Total net worth:", total)
        .addField("Users that are gone:", usersGone)
        .addField("Moderators:", mods, true)
        .addField("Uncoloured users:", uncoloured, true);
    await msg.edit({ embed });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["countshards", "shardcount"],
  permLevel: "User",
  channelPerms: "Diplo",
  userCooldown: true,
  globalCooldown: false,
  cooldownDuration: 30
};

exports.help = {
  name: "shards",
  category: "Flairwars",
  description: "Counts number of shards per colour. 30 seconds user cooldown.",
  usage: "shards"
};