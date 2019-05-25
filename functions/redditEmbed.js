const { RichEmbed } = require('discord.js');

module.exports = {
    getColourInfoFromFlair: function(client, flair) {
        // Filter out the season winner ticks
        let colour = client.config.flairs.find(colour => flair.includes(colour));
        // But it doesn't filter mods/ex mods :sedcet:
        if (flair === "Mod" || flair === "Ex Mod") colour = flair;
        return client.config.flairInfo[colour.toLowerCase()];
    },
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