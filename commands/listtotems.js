exports.run = async (client, message, args, level) => {
    let totemBots = await message.guild.roles.find(role => role.name === "Totem").members.filter(member => member.user.bot);

    console.log("Totem bots:");
    console.log(totemBots.map(member => member.user.username).join('\n'));

    const colours = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];

    let colourString = "\`\`\`yaml\nCurrent state of the totems\n\`\`\`";

    colours.forEach(colour => {
        const colourTotems = totemBots.filter(member => member.roles.find(role => role.name === colour));
        const totemString = colourTotems.size > 0 ? colourTotems.map(member => (`<@${member.id}>`)).join('\n') : "none";
        colourString = `${colourString}**${colour} totems:**\n${totemString}\n`;
    });
    message.channel.send(colourString);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User",
  channelPerms: "Fun"
};

exports.help = {
  name: "listtotems",
  category: "Miscelaneous",
  description: "Displays the list of totems and who owns them",
  usage: "listtotems"
};