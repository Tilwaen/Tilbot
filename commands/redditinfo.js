const { RichEmbed } = require('discord.js');
const redditEmbed = require('../functions/redditEmbed.js');

/**
 * Prints info about a specified Reddit account
 */
exports.run = async (client, message, args, level, r, unbClient) => {
    if (args.length !== 1) {
        await message.channel.send("Please specify a Reddit account");
        return;
    }

    let prefixRegex = /\/?u\//;
    // Filters out the possible /u/ or u/ prefix, as well as an empty string after the split
    // Simply put, this extracts the username from the input
    let username = args[0].split(prefixRegex).filter(Boolean)[0];

    var redditUser;
    var userFlair;

    // Get the Reddit user and check their flair on the main subreddit
    try {
        redditUser = await r.getUser(username).fetch();
        userFlair = await r.getSubreddit('flairwars').getUserFlair(username);
    } catch (error) {
        message.channel.send("This is not a valid Reddit account: https://www.reddit.com/u/" + username);
        return;
    };

    let flair = userFlair.flair_text ? userFlair.flair_text : 'None';
    let colourInfo = redditEmbed.getColourInfoFromFlair(flair);
    let karma = redditUser.link_karma + redditUser.comment_karma;

    let accountCreated = redditUser.created_utc;
    let age = new Date(accountCreated * 1000).toDateString();

    sendRedditUserEmbed(message.channel, username, colourInfo, karma, age);
};

async function sendRedditUserEmbed(channel, username, colourInfo, karma, age) {
    var embed = new RichEmbed()
        .setColor(colourInfo.colourHex)
        .setTitle("/u/" + username)
        .setURL("https://www.reddit.com/u/" + username)
        .setThumbnail(colourInfo.iconUrl)
        .addField("Flair", colourInfo.name, true)
        .addField("Account created", age, true)
        .addField("Karma", karma, true)
    await channel.send({ embed });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "redditinfo",
  category: "Miscelaneous",
  description: "Gives information about a Reddit user.",
  usage: "redditinfo <Reddit account>"
};