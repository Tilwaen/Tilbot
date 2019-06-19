const { RichEmbed } = require('discord.js');

module.exports = {
    sendRedditUserEmbed: async function(channel, colourInfo, karma, age, title, description) {
        var embed = new RichEmbed();

        embed.setColor(colourInfo.colourHex)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(colourInfo.iconUrl)
            .addField("Flair", colourInfo.name, true)
            .addField("Account created", age, true)
            .addField("Karma", karma, true);

        await channel.send({ embed });
    },
    getColourInfoFromFlair: function(client, flair) {
        // Filter out the season winner ticks
        let colour = client.config.flairs.find(colour => flair.includes(colour));
        // But it doesn't filter mods/ex mods :sedcet:
        if (flair === "Mod" || flair === "Ex Mod") colour = flair;
        return client.config.flairInfo[colour.toLowerCase()];
    },
    getFlair: async function(r, username) {
        const userFlair = await r.getSubreddit('flairwars').getUserFlair(username);
        return userFlair.flair_text ? userFlair.flair_text : 'None';
    }
}