exports.run = async (client, message, args, level, r, unbClient) => {
    let totemBots = await message.guild.roles
                                        .find(role => role.name === "Totem")
                                        .members.filter(member => member.user.bot);

    const colours = client.config.colours;

    // Turqoise header
    let colourString = "\`\`\`yaml\nCurrent state of the totems\n\`\`\`";

    colours.forEach(colour => {
        // For each colour, get the totem bots of this colour
        const colourTotems = totemBots.filter(member => member.roles.find(role => role.name === colour));
        // Either create a list of mentions from the totems of this colour, or there are no totems and print "none" instead
        const totemString = colourTotems.size > 0
                                ? colourTotems.map(member => (`<@${member.id}>`)).join('\n')
                                : "none";
        colourString = `${colourString}**${colour} totems:**\n${totemString}\n`;
    });
    await message.channel.send(colourString);

    // Delete the trigger message
    message.delete().catch(console.error);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["totems", "totemlist"],
  permLevel: "User",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "listtotems",
  category: "Flairwars",
  description: "Displays the list of totems and who owns them",
  usage: "listtotems"
};