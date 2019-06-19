const { RichEmbed } = require('discord.js');
const reddit = require('../functions/redditFunctions.js');

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

    // Get the Reddit user and check their flair on the main subreddit
    try {
        redditUser = await r.getUser(username).fetch();
    } catch (error) {
        message.channel.send("This is not a valid Reddit account: https://www.reddit.com/u/" + username);
        return;
    };

    let flair = await reddit.getFlair(r, username);
    let colourInfo = reddit.getColourInfoFromFlair(client, flair);
    let karma = redditUser.link_karma + redditUser.comment_karma;

    let accountCreated = redditUser.created_utc;
    let age = new Date(accountCreated * 1000).toDateString();

    // channel, colourInfo, karma, age, title, description
    reddit.sendRedditUserEmbed(message.channel, colourInfo, karma, age, "/u/" + username, `[/u/${username}](https://www.reddit.com/u/${username})`);
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