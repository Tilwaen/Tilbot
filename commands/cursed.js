const imageReply = require('../functions/imagereply.js');

const subreddits = ["cursedimages", "cursedfood"];

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
  name: "cursed",
  category: "Images",
  description: "Posts a random cursed image from r/cursedimages or r/cursedfood",
  usage: "cursed"
};