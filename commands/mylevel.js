exports.run = async (client, message, args, level, r, unbClient) => {
  const friendly = client.config.permLevels.find(l => l.level === level).name;
  message.reply(`Your permission level is: ${level} - ${friendly}`);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User",
  channelPerms: "Colour",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "mylevel",
  category: "Miscelaneous",
  description: "Tells you your permission level for the current message location.",
  usage: "mylevel"
};
