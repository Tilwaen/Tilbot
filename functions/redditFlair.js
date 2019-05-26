module.exports = {
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