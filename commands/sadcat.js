const imageReply = require('../functions/imagereply.js');

const subreddits = ["sadcats"];

exports.run = async (client, message, args, level) => {
    const imageUrl = await imageReply.getImage(subreddits);
    await imageReply.sendImageEmbed(message.channel, imageUrl);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User",
  channelPerms: "Fun"
};

exports.help = {
  name: "sadcat",
  category: "Images",
  description: "Posts a random sadcat image from r/sadcats",
  usage: "sadcat"
};