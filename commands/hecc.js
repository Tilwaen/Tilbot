exports.run = async (client, message, args, level) => {
  const msg = await message.channel.send("Hecc u");
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "hecc",
  category: "Miscelaneous",
  description: "Hecc u",
  usage: "hecc"
};
