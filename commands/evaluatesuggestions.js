const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args, level, r, unbClient) => {

    const limit = 100;

    const suggestConfig = client.config.suggestions;
    const suggestionPollChannel = message.guild.channels.get(suggestConfig.pollChannelID);
    const suggestionModPollChannel = message.guild.channels.get(suggestConfig.modPollChannelID);

    const messages = await suggestionModPollChannel.fetchMessages({ limit: limit });

    var suggestions = [ ...messages.values() ]                                  // Create an array from the [id, message] map
                                .filter(msg => msg.author === client.user)      // Filter only messages from this bot
                                .filter(msg => msg.embeds.length > 0)           // Filter only embed messages
                                .filter(msg => msg.embeds[0].author.name.includes(`Suggestion by `))  // Filter only suggestions
                                .filter(msg => msg.embeds[0].color === suggestConfig.inProgressColourDecimal);     // The embeds are using the decimal representation of the colour

    for (const modPollSuggestion of suggestions) {
        var modPollEmbed = modPollSuggestion.embeds[0];

        var newModPollEmbed = new RichEmbed()
            .setDescription(modPollEmbed.description)
            .setAuthor(modPollEmbed.author.name, modPollEmbed.author.iconURL)
            .setTimestamp(modPollEmbed.timestamp)
            .setFooter(modPollEmbed.footer.text);

        // number Likes, number Dislikes | ID: number
        const footer = modPollEmbed.footer.text;
        // Get only the ID part
        const pollChannelMsgID = footer.split(/ID: /)[1];
        const pollChannelMsg = await suggestionPollChannel.fetchMessage(pollChannelMsgID);

        var newPollEmbed = new RichEmbed()
            .setDescription(modPollEmbed.description)
            // The embed in the regular poll channel doesn't have a number attached to it
            .setAuthor(pollChannelMsg.embeds[0].author.name, modPollEmbed.author.iconURL)
            .setTimestamp(modPollEmbed.timestamp)
            .setFooter(modPollEmbed.footer.text);

        const likes = modPollSuggestion.reactions.get("👍").count;
        const dislikes = modPollSuggestion.reactions.get("👎").count;

        // Accept the suggestion if the number of likes is higher than the number of dislikes
        if (likes > dislikes) {
            newModPollEmbed.setColor(suggestConfig.acceptedColour);
            newPollEmbed.setColor(suggestConfig.acceptedColour);
            newPollEmbed.setFooter(`Suggestion was accepted`);
        } else {
            newModPollEmbed.setColor(suggestConfig.rejectedColour);
            newPollEmbed.setColor(suggestConfig.rejectedColour);
            newPollEmbed.setFooter(`Suggestion was rejected`);
        }

        // Update both the embeds in the mod channel and in the regular voting channel
        await modPollSuggestion.edit(newModPollEmbed);
        await pollChannelMsg.edit(newPollEmbed);
    }

    await message.react('👌');   // :ok_hand:
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["suggestionevaluate", "suggestionsevaluate", "evaluatepolls", "pollsevaluate"],
  permLevel: "Oil",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "evaluatesuggestions",
  category: "Moderating",
  description: "Updates the colour of the suggestion embeds.",
  usage: "evaluatesuggestions"
};