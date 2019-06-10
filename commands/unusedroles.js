exports.run = async (client, message, args, level, r, unbClient) => {
    // Those member ids are to filter out SSeptic boopis because of his constant attempt to break Discord by acquiring every single role possible
    let unusedRoles = message.guild.roles                                                                           // Filter out roles to contain...
                                    .filter(role => !message.guild.members                                          // no such role that...
                                                        .some(member => member.roles.has(role.id)                   // any user would have this role...
                                                                        && (member.user.id !== 391963807771000843   // unless the user is (SSeptic || boopis)
                                                                            && member.user.id !== 476536649074081802)));
    await message.reply(`Number of unused roles: ${unusedRoles.size}\n${unusedRoles.map(role => role.name).join('\n')}`);
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
  name: "unusedroles",
  category: "Moderating",
  description: "Lists roles which aren't used by anyone.",
  usage: "unusedroles"
};
