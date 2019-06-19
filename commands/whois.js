const { RichEmbed } = require('discord.js');
const reddit = require('../functions/redditFunctions.js');
const util = require('../functions/util.js');
/**
 * Prints Reddit and Discord info about the mentioned user.
 * This command relies on each user having their server nicknames in the format of /u/RedditUsername
 */
exports.run = async (client, message, args, level, r, unbClient) => {

    const member = util.getGuildMemberFromArg(message, args);
    if (!member) {
        message.channel.send(`Cannot find member with username ${args[0]} on this Discord server.`);
        return;
    }

    // The Reddit account most probably won't match if the user doesn't have a nickname; send only Discord info
    if (!member.nickname) {
        await message.channel.send(`User ${member.user.username} doesn't have a nickname - sending Discord info only.`);
        await sendDiscordEmbed(client, message.channel, member);
        return;
    }

    let prefixRegex = /\/?u\//;
    // Filters out the possible /u/ or u/ prefix, as well as an empty string after the split
    let username = member.nickname.split(prefixRegex).filter(Boolean)[0];

    var redditUser;

    try {
        redditUser = await r.getUser(username).fetch();
    } catch (error) {
        message.channel.send(`This is not a valid Reddit account: https://www.reddit.com/u/${username}; sending Discord info only.`);
        await sendDiscordEmbed(client, message.channel, member);
        return;
    };

    let flair = await reddit.getFlair(r, username);
    let colourInfo = reddit.getColourInfoFromFlair(client, flair);
    let karma = redditUser.link_karma + redditUser.comment_karma;

    let accountCreated = redditUser.created_utc;
    let redditAge = new Date(accountCreated * 1000).toDateString();

    const trophies = await redditUser.getTrophies();

    await sendRedditUserEmbed(message.channel, username, colourInfo, karma, redditAge, trophies.trophies, member, true);
};

async function sendDiscordEmbed(client, channel, discordMember) {
    await sendRedditUserEmbed(channel, "", reddit.getColourInfoFromFlair(client, "None"), 0, 0, discordMember, false);
}

async function sendRedditUserEmbed(channel, username, colourInfo, karma, redditAge, trophies, discordMember, sendRedditInfo) {
    var embed = new RichEmbed()
        .setColor(colourInfo.colourHex)
        .setTitle(discordMember.user.tag)
        .setThumbnail(discordMember.user.avatarURL)
        .setFooter("ID: " + discordMember.user.id)

    if (sendRedditInfo) {
        embed.addField("Flair", colourInfo.name)
            .addField("Reddit account created", redditAge, true)
            .addField("Karma", karma, true)
            .setDescription(`${discordMember}\n[/u/${username}](https://www.reddit.com/u/${username})`);
    } else {
        embed.setDescription(`${discordMember}`);
    }

    if (trophies.length > 0) {
        embed.addField("Trophies", trophies.map(trophy => trophy.name).join('\n'));
    }

    const roles = Array.from(discordMember.roles, ([id, role]) => role)    // Map the map values to an array
                                                                .filter(role => role.id !== discordMember.guild.id) // Filter out everyone role
                                                                .join(' ');

    embed.addField("Discord account created", discordMember.user.createdAt.toDateString(), true)
        .addField("Joined this server", discordMember.joinedAt.toDateString(), true)
        .addField("Roles", roles ? roles : "No roles assigned");

    await channel.send({ embed });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["user", "info", "userinfo"],
  permLevel: "User",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "whois",
  category: "Miscelaneous",
  description: "Gives information about a user.",
  usage: "whois <user>"
};