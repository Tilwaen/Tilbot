const { Client } = require('unb-api');

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
        colourTotal += v;
    }

    var text = `**Shards per colour:**\n\n${colourString}**Total colour net worth:** ${colourTotal}\n\n`;

    var usersGoneBalance = 0;
    var usersModeratorsBalance = 0;
    var usersNotColouredBalance = 0;

    // Append additional text
    if (usersGone.length > 0) {
        var stringUsersGone = `**User IDs of those who are not on the server anymore:**\n`;
        usersGone.forEach(user => {
            stringUsersGone = `${stringUsersGone}ID: ${user.userID}, balance: ${user.cash}\n`;
            usersGoneBalance += user.cash;
        });
        text = text + stringUsersGone;
    }
    if (usersModerators.length > 0) {
        var stringUsersModerators = `**Moderators who have shards:**\n`;
        usersModerators.forEach(user => {
            stringUsersModerators = `${stringUsersModerators}${user.user}, balance: ${user.cash}\n`;
            usersModeratorsBalance += user.cash;
        });
        text = text + stringUsersModerators;
    }
    if (usersNotColoured.length > 0) {
        var stringUsersNotColoured = `**Users who have shards and not a colour:**\n`;
        usersNotColoured.forEach(user => {
            stringUsersNotColoured = `${stringUsersNotColoured}${user.user}, balance: ${user.cash}\n`;
            usersNotColouredBalance += user.cash;
        });
        text = text + stringUsersNotColoured;
    }
    text = text + "**Total net worth:** " + (colourTotal + usersGoneBalance + usersModeratorsBalance + usersNotColouredBalance);

    await msg.edit(text);
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