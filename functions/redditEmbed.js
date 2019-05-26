const { RichEmbed } = require('discord.js');

module.exports = {
    sendRedditUserEmbed: async function(channel, discordUser, redditUsername, colourInfo, karma, age, title, description) {
        var embed = new RichEmbed();

        embed.setColor(colourInfo.colourHex)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(colourInfo.iconUrl)
            .addField("Flair", colourInfo.name, true)
            .addField("Account created", age, true)
            .addField("Karma", karma, true);

        await channel.send({ embed });
    }
}