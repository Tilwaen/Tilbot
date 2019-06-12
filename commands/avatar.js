const imageReply = require('../functions/imagereply.js');

exports.run = async (client, message, args, level, r, unbClient) => {

    // If there is no argument, take the author of the message, otherwise take the first mention
    var member = (args.length < 1) ? message.member : message.mentions.members.first();

    // No mention
    if (!member) {
        guildMemberMatch = message.guild.members
                .filter(m => m.nickname)
                .find(m => m.nickname.toLowerCase().includes(args[0].toLowerCase()));
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

    await imageReply.sendImageEmbed(message.channel, member.user.avatarURL);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["userpfp", "pfp", "useravatar"],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "avatar",
  category: "Miscelaneous",
  description: "Posts the server icon.",
  usage: "avatar <user>"
};