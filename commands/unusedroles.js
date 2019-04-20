exports.run = async (client, message, args, level) => {
    let unusedRoles = message.guild.roles.filter(role => !message.guild.members.some(member => member.roles.has(role.id) && member.user.id !== 391963807771000843));
    await message.reply(`Number of unused roles: ${unusedRoles.size}\n${unusedRoles.map(role => role.name).join('\n')}`);
    console.log(`Number of unused roles: ${unusedRoles.size}\n${unusedRoles.map(role => role.name).join('\n')}`);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "Minimod",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "unusedroles",
  category: "Moderating",
  description: "Lists roles which aren't used by anyone.",
  usage: "unusedroles"
};