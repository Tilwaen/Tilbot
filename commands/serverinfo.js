const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args, level, r, unbClient) => {

    const guild = message.guild;
    const date = guild.createdAt;

    var embed = new RichEmbed()
        .setColor(client.config.flairInfo.mod.colourHex)
        .setAuthor(guild.name, guild.iconURL)
        .setFooter(`ID: ${guild.id} | Server created: ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`) // Month +1 because of course it is zero-indexed
        .addField("Owner", guild.owner.user.tag, true)
        .addField("Region", guild.region, true)
        .addField("Channel categories", guild.channels.filter(channel => channel.type === 'category').size, true)
        .addField("Text channels", guild.channels.filter(channel => channel.type === 'text').size, true)
        .addField("Voice channels", guild.channels.filter(channel => channel.type === 'voice').size, true)
        .addField("Members", guild.memberCount, true)
        .addField("Humans", guild.members.filter(member => !member.user.bot).size, true)
        .addField("Bots", guild.members.filter(member => member.user.bot).size, true)
        .addField("Online", guild.members.filter(member => member.presence.status === 'online').size, true)
        .addField("Roles", guild.roles.size, true)
        .addField("Moderators", Array.from(guild.members
                                            .filter(member => member.roles.find(role => role.name === client.config.defaultSettings.adminRole)) // Filter mods
                                            .values())  // Convert the map values to an array
                                        .join('\n'));   // Join the array values by a newline to print them out nicely

    await message.channel.send({ embed });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "serverinfo",
  category: "Miscelaneous",
  description: "Gives information about this server.",
  usage: "serverinfo"
};