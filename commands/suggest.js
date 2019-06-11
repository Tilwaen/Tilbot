const { RichEmbed } = require('discord.js');
const util = require('../functions/util.js');

exports.run = async (client, message, args, level, r, unbClient) => {

    if (args.length === 0) {
        await message.channel.send("You didn't include any suggestion text.");
        return;
    }

    const suggestConfig = client.config.suggestions;
    const suggestionDiscussionChannel = message.guild.channels.get(suggestConfig.discussionChannelID);
    const suggestionPollChannel = message.guild.channels.get(suggestConfig.pollChannelID);

    const text = util.getMessageArgumentContent(message);

    var embedDiscussion = new RichEmbed()
        .setColor(suggestConfig.defaultColour)
        .setDescription(`${text}\n\n**Vote on it in ${suggestionPollChannel}**`)
        .setAuthor(`Suggestion by ${message.author.tag}`, message.author.avatarURL)
        .setTimestamp(message.createdTimestamp);

    var embedPolls = new RichEmbed()
        .setColor(suggestConfig.defaultColour)
        .setDescription(text)
        .setAuthor(`Suggestion by ${message.author.tag}`, message.author.avatarURL)
        .setTimestamp(message.createdTimestamp);

    await suggestionDiscussionChannel.send(embedDiscussion);
    const pollMsg = await suggestionPollChannel.send(embedPolls);

    await pollMsg.react("👍");   // up
    await pollMsg.react("👎");   // down

    await message.delete();
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["suggestion"],
  permLevel: "User",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "suggest",
  category: "Miscelaneous",
  description: "Creates a suggestion for the mods.",
  usage: "suggest [text of suggestion]"
};