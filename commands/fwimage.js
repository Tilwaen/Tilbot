const imageReply = require('../functions/imagereply.js');

const subreddits = ["flairwars"];

exports.run = async (client, message, args, level, r, unbClient) => {
    const imagePost = await imageReply.getSubredditImagePost(r, subreddits);
    await imageReply.sendImageEmbedWithAuthor(message.channel, imagePost.url, imagePost.author);
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