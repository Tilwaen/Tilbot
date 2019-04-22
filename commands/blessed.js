const imageReply = require('../functions/imagereply.js');

const subreddits = ["blessedimages"];

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
  name: "blessed",
  category: "Images",
  description: "Posts a random blessed image from r/blessedimages",
  usage: "blessed"
};