const imageReply = require('../functions/imagereply.js');

exports.run = async (client, message, args, level, r, unbClient) => {
    const imageUrl = await imageReply.getImageCatAPI(`http://thecatapi.com/api/images/get?format=json`);
    await imageReply.sendImageEmbed(message.channel, imageUrl);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "cat",
  category: "Images",
  description: "Posts a random image of a cat",
  usage: "cat"
};