const { RichEmbed } = require('discord.js');
// This command relies on each user having their server nicknames in the format of /u/RedditUsername
exports.run = async (client, message, args, level, r, unbClient) => {

    // If there is no argument, take the author of the message, otherwise take the first mention
    var member = (args.length < 1) ? message.member : message.mentions.members.first();

    // No mention
    if (!member) {
        // Find the corresponding guild member nickname
        guildMemberMatch = message.guild.members.find(m => m.nickname.toLowerCase().includes(args[0].toLowerCase()));
        member = guildMemberMatch;
        if (!guildMemberMatch) {
            // Find the corresponding user Discord username
            discordUsernameMatch = message.guild.members.find(m => m.user.username.toLowerCase().includes(args[0].toLowerCase()));
            member = discordUsernameMatch;
            if (!discordUsernameMatch) {
                message.channel.send(`Cannot find member with username ${args[0]} on this Discord server.`);
                return;
            }
        }
    }

    let prefixRegex = /\/?u\//;
    // Filters out the possible /u/ or u/ prefix, as well as an empty string after the split
    let username = member.nickname.split(prefixRegex).filter(Boolean)[0];

    var redditUser;
    var userFlair;

    try {
        redditUser = await r.getUser(username).fetch();
        userFlair = await r.getSubreddit('flairwars').getUserFlair(username);
    } catch (error) {
        message.channel.send("This is not a valid Reddit account: https://www.reddit.com/u/" + username);
        return;
    };

    let flair = userFlair.flair_text ? userFlair.flair_text : 'None';
    let karma = redditUser.link_karma + redditUser.comment_karma;

    let accountCreated = redditUser.created_utc;
    let redditAge = new Date(accountCreated * 1000).toDateString();

    sendRedditUserEmbed(message.channel, username, flair, karma, redditAge, member);
};

async function sendRedditUserEmbed(channel, username, flair, karma, redditAge, discordMember) {
    let colours = [
        { name: "Red", imageUrl: "https://i.imgur.com/SChaKoz.jpg", colourHex: "#AF0303" },
        { name: "Orange", imageUrl: "https://i.imgur.com/CewHt0f.png", colourHex: "#F99A0C" },
        { name: "Yellow", imageUrl: "https://i.imgur.com/835G1zP.jpg", colourHex: "#FFE500" },
        { name: "Green", imageUrl: "https://i.imgur.com/MNKwjES.jpg", colourHex: "#3ACE04" },
        { name: "Blue", imageUrl: "https://i.imgur.com/8AJrVmx.png", colourHex: "#213AEF" },
        { name: "Purple", imageUrl: "https://i.imgur.com/rZFSCIP.jpg", colourHex: "#AF0ECC" },
        { name: "Mod", imageUrl: "https://i.imgur.com/Z0AM4lA.png", colourHex: "#C9DDFF" },
        { name: "None", imageUrl: "https://i.imgur.com/dmJbwoN.png", colourHex: "#C9DDFF" }
    ];

    let colour = colours.find(colour => flair.includes(colour.name));

    var embed = new RichEmbed()
        .setColor(colour.colourHex)
        .setTitle("/u/" + username)
        .setURL("https://www.reddit.com/u/" + username)
        .setThumbnail(discordMember.user.avatarURL)
        .setFooter("ID: " + discordMember.user.id)
        .addField("Flair", flair)
        .addField("Reddit account created", redditAge, true)
        .addField("Karma", karma, true)
        .addField("Discord account created", discordMember.user.createdAt.toDateString(), true)
        .addField("Joined this server", discordMember.joinedAt.toDateString(), true)
        .addField("Roles", discordMember.roles.map(([id, role]) => role));
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