const imageReply = require('../functions/imagereply.js');

const subreddits = ["cursedimages", "cursedfood"];

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
  name: "cursed",
  category: "Images",
  description: "Posts a random cursed image from r/cursedimages or r/cursedfood",
  usage: "cursed"
};