const { RichEmbed } = require('discord.js');
const fetch = require("node-fetch");

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
    },
    // type: "submission" or "comment"
    // Doesn't use snoowrap, but pushshift to fetch the submissions
    getUserSubmissions: async function(username, type) {
        let limit = 1000;
        let fetchedData = [];
        let before;
        let request = "";
        let dataLength;
        const maxIterations = 100;
        var iterations = 0;

        do {
            if (before) {
                request = `https://api.pushshift.io/reddit/${type}/search/?author=${username}&sort=desc&sort_type=created_utc&limit=${limit}&before=${before}`;
            } else {
                request = `https://api.pushshift.io/reddit/${type}/search/?author=${username}&sort=desc&sort_type=created_utc&limit=${limit}`;
            }

            const newFetchedData = await fetch(request);
            const newFetchedDataJson = await newFetchedData.json();
            dataLength = newFetchedDataJson.data.length;

            fetchedData = fetchedData.concat(newFetchedDataJson.data);

            before = newFetchedDataJson.data[dataLength - 1].created_utc;
            iterations++;
        } while (dataLength === limit && iterations < maxIterations)

        return fetchedData;
    }
}