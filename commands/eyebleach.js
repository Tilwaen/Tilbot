const imageReply = require('../functions/imagereply.js');

const subreddits = ["eyebleach", "aww", "mlem"];

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
  name: "eyebleach",
  category: "Images",
  description: "Posts a random eyebleach image from r/eyebleach, r/aww or r/mlem",
  usage: "eyebleach"
};