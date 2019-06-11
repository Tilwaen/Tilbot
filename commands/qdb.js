const { RichEmbed } = require('discord.js');
const util = require('../functions/util.js');

exports.run = async (client, message, args, level, r, unbClient) => {

    const qdbChannelID = '466292953959104512';
    const qdbChannel = message.guild.channels.get(qdbChannelID);

    const messages = await qdbChannel.fetchMessages({ limit: 100 });
    const msgArray = Array.from(messages.values());
    const randomMsg = util.getRandomEntry(msgArray);

    if (randomMsg.attachments.size > 0) {
        const text = `Posted by **${randomMsg.author.tag}**`;
        // Get the first value from the _map_ of attachments (ugly, I know)
        const attachment = randomMsg.attachments.values().next().value.url;
        await message.channel.send(text, { file: attachment });
    }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["quote", "quotedatabase"],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "qdb",
  category: "Fun",
  description: "Posts a random quote from the quote database.",
  usage: "qdb"
};