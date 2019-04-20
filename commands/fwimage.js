const imageReply = require('../functions/imagereply.js');

const subreddits = ["flairwars"];

exports.run = async (client, message, args, level, r) => {
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
  name: "fwimage",
  category: "Images",
  description: "Posts a random image from r/flairwars",
  usage: "fwimage"
};