const imageReply = require('../functions/imagereply.js');

exports.run = async (client, message, args, level, r, unbClient) => {
    await imageReply.sendImageEmbed(message.channel, message.guild.iconURL);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["serveravatar", "serverpfp"],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "servericon",
  category: "Miscelaneous",
  description: "Posts the server icon.",
  usage: "servericon"
};