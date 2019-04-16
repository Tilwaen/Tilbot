exports.run = async (client, message, args, level) => {
    let unusedRoles = message.guild.roles.filter(role => !message.guild.members.some(member => member.roles.has(role.id) && member.user.id !== 391963807771000843));
    await message.reply(`Number of unused roles: ${unusedRoles.size}\n${unusedRoles.map(role => role.name).join('\n')}`);
    console.log(`Number of unused roles: ${unusedRoles.size}\n${unusedRoles.map(role => role.name).join('\n')}`);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Mini Mod (50% oil)"
};

exports.help = {
  name: "unusedroles",
  category: "Moderating",
  description: "Lists roles which aren't used by anyone.",
  usage: "unusedroles"
};

/*exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "r/flairwars moderator"
};

exports.help = {
  name: "unusedroles",
  category: "Moderating",
  description: "Lists roles which aren't used by anyone.",
  usage: "unusedroles"
};*/