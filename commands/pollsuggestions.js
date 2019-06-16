const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args, level, r, unbClient) => {

    const limit = 100;

    // User can specify number of *new* messages to exclude from polling on so far.
    // Good for excluding too fresh suggestions which haven't gained enough upvotes yet
    const numOfExcludedMessages = (args.length > 0 && parseInt(args[0]) !== undefined && parseInt(args[0]) < 100)
                                    ? parseInt(args[0])
                                    : 0;

    const infoMsg = await message.channel.send("Number of excluded suggestions: " + numOfExcludedMessages);

    const suggestConfig = client.config.suggestions;
    const suggestionPollChannel = message.guild.channels.get(suggestConfig.pollChannelID);
    const suggestionModPollChannel = message.guild.channels.get(suggestConfig.modPollChannelID);

    const messages = await suggestionPollChannel.fetchMessages({ limit: limit });
    var suggestions =   messages.filter(msg => msg.author === client.user)      // Filter only messages from this bot
                                .filter(msg => msg.embeds.length > 0)           // Filter only embed messages
                                .filter(msg => msg.embeds[0].author.name.includes(`Suggestion by `))  // Filter only suggestions
                                .filter(msg => msg.embeds[0].color === suggestConfig.defaultColourDecimal);     // The embeds are using the decimal representation of the colour

    // Create an array from the map of messages (used to be [id, message])
    suggestions = [ ...suggestions.values() ];
    // Exclude a number of messages specified in an argument
    suggestions = suggestions.slice(numOfExcludedMessages);
    // and reverese it so that the oldest suggestions go first
    suggestions.reverse();

    var numOfAcceptedSuggestions = 0;

    for (const suggestion of suggestions) {
        var receivedEmbed = suggestion.embeds[0];

        var embed = new RichEmbed()
            .setDescription(receivedEmbed.description)
            .setTimestamp(receivedEmbed.timestamp);

        const likes = suggestion.reactions.get("👍").count;
        const dislikes = suggestion.reactions.get("👎").count;

        // +1 to counter the bot's reaction)
        if (likes < suggestConfig.votesToPass + 1) {
            embed.setAuthor(receivedEmbed.author.name, receivedEmbed.author.iconURL)
                .setColor(suggestConfig.rejectedColour)
                .setFooter(`Suggestion was rejected`);
        } else {
            // Send the embed to the mod voting channel
            numOfAcceptedSuggestions++;
            embed.setAuthor(`${numOfAcceptedSuggestions}) ${receivedEmbed.author.name}`, receivedEmbed.author.iconURL)
                .setColor(suggestConfig.inProgressColour)
                .setFooter(`${likes} 👍, ${dislikes} 👎 | ID: ${suggestion.id}`);      // ID of the message so that we can fetch it later easily
            const modPollEmbed = await suggestionModPollChannel.send(embed);

            await modPollEmbed.react("👍");   // up
            await modPollEmbed.react("👎");   // down
            await modPollEmbed.react("🤷");   // shrug

            // Edit the embed in the regular voting channel
            embed.setAuthor(receivedEmbed.author.name, receivedEmbed.author.iconURL)
                .setFooter(`Suggestion is being polled on`);
        }

        await suggestion.edit(embed);
    }

    await infoMsg.delete();
    await message.react('👌');   // :ok_hand:
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["suggestionpolls", "suggestionspolls"],
  permLevel: "Oil",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "pollsuggestions",
  category: "Moderating",
  description: "Mirrors the suggestions with high enough score to the mod voting channel.",
  usage: "pollsuggestions <number of excluded suggestions>"
};