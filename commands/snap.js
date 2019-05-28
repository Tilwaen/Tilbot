exports.run = async (client, message, args, level, r, unbClient) => {
    var member = message.mentions.members.first();
    member = member ? member : message.member;

    // Snowflake ID is parsed as string for whatever reason - take only its last number
    const snapped = (member.user.id[member.user.id.length - 1] % 2) === 0;

    const snappedMessage = snapped
                            ? `${member.user.username} was **SNAPPED**`
                            : `${member.user.username} was **SPARED**`;

    await message.channel.send(snappedMessage);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "snap",
  category: "Fun",
  description: "*snap*",
  usage: "snap <mention>"
};