exports.run = async (client, message, args, level, r, unbClient) => {
    let botRole = message.guild.roles.find(role => role.name === "Tilbot");
    //let regex = /^(\\?u\/)/;
    let regex = /^((\\?u\/\/?)|(\|?u\|)|(\/u\\))/;
    const msg = await message.channel.send("Changing the nicknames...");
    // .comparePositionTo() is negative if this position is lower (the other role is higher)
    await message.guild.members
            .filter(m => m.highestRole.comparePositionTo(botRole) < 0)
            .filter(m => m.nickname)
            .filter(m => regex.test(m.nickname))
            .forEach(member => member.setNickname('/u/' + member.nickname.split(regex).slice(5)));
    await msg.edit(`Nicknames changed`);

};

exports.conf = {
  enabled: false,
  guildOnly: false,
  aliases: [],
  permLevel: "Oil",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "recovernicknames",
  category: "Miscelaneous",
  description: "As if nothing happened",
  usage: "recovernicknames"
};