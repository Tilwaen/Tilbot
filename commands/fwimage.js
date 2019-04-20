const imageReply = require('../functions/imagereply.js');

const subreddits = ["flairwars"];

exports.run = async (client, message, args, level) => {
    const imageUrl = await imageReply.getSubredditImage(subreddits);
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
  name: "fwimage",
  category: "Images",
  description: "Posts a random image from r/flairwars",
  usage: "fwimage"
};