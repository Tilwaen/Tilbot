const imageReply = require('../functions/imagereply.js');

exports.run = async (client, message, args, level) => {
    const imageUrl = await imageReply.getImageCatAPI(`https://api.thedogapi.com/v1/images/search`);
    await imageReply.sendImageEmbed(message.channel, imageUrl);
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
  name: "dog",
  category: "Images",
  description: "Posts a random image of a dog",
  usage: "dog"
};