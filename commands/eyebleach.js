const imageReply = require('../functions/imagereply.js');

const subreddits = ["eyebleach", "aww"];

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
  name: "eyebleach",
  category: "Images",
  description: "Posts a random eyebleach image from r/eyebleach or r/aww",
  usage: "eyebleach"
};