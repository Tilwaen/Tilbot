const imageReply = require('../functions/imagereply.js');

const subreddits = ["sadcats"];

exports.run = async (client, message, args, level, r, unbClient) => {
    const imageUrl = await imageReply.getSubredditImage(r, subreddits);
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
  name: "sadcat",
  category: "Images",
  description: "Posts a random sadcat image from r/sadcats",
  usage: "sadcat"
};