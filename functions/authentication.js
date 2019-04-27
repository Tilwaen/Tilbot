const { RichEmbed } = require('discord.js');

module.exports = {
    authSuccess: async function (client, r, authReq, response, state) {
        const userID = Buffer.from(state, 'base64').toString('ascii');
        const message = authReq.get(userID);
        authReq.delete(userID);

        if (!message) {
            // TODO: The user hasn't clicked the link for more than one hour
            // think of some clever way how to convey that to him when you don't
            // have the channel because of the way how you built this thing, you dumbass
            return;
        }

        // This doesn't make any sense. The state string should be a random unguessable string
        /*if (tag !== message.author.tag) {
            message.reply("The message author doesn't match. Please don't give the authorization link to anyone else.");
        }*/

        const discordUser = message.author;
        const redditUsername = response.data.name;
        const karma = response.data.link_karma + response.data.comment_karma;
        const accountCreated = response.data.created_utc;
        const age = new Date(accountCreated * 1000).toDateString();

        var userFlair;
        try {
            userFlair = await r.getSubreddit('flairwars').getUserFlair(redditUsername);
        } catch (error) {
            message.channel.send("This is not a valid Reddit account: https://www.reddit.com/u/" + redditUsername);
            return;
        };
        let flair = userFlair.flair_text ? userFlair.flair_text : 'None';

        sendRedditUserEmbed(message.channel, discordUser, redditUsername, flair, karma, age);
    },
    authFailure: function (client, r, authReq, response, state) {
        const userID = Buffer.from(state, 'base64').toString('ascii');
        const message = authReq.get(userID);
        authReq.delete(userID);

        if (!message) {

        } else {
            message.reply("The authentication wasn't successful.");
        }
    }
};

async function sendRedditUserEmbed(channel, discordUser, redditUsername, flair, karma, age) {
    let colours = [
        { name: "Red", imageUrl: "https://i.imgur.com/SChaKoz.jpg", colourHex: "#AF0303" },
        { name: "Orange", imageUrl: "https://i.imgur.com/CewHt0f.png", colourHex: "#F99A0C" },
        { name: "Yellow", imageUrl: "https://i.imgur.com/835G1zP.jpg", colourHex: "#FFE500" },
        { name: "Green", imageUrl: "https://i.imgur.com/MNKwjES.jpg", colourHex: "#3ACE04" },
        { name: "Blue", imageUrl: "https://i.imgur.com/8AJrVmx.png", colourHex: "#213AEF" },
        { name: "Purple", imageUrl: "https://i.imgur.com/rZFSCIP.jpg", colourHex: "#AF0ECC" },
        { name: "Mod", imageUrl: "https://i.imgur.com/Z0AM4lA.png", colourHex: "#C9DDFF" },
        { name: "None", imageUrl: "https://i.imgur.com/dmJbwoN.png", colourHex: "#C9DDFF" }
    ];

    let colour = colours.find(colour => flair.includes(colour.name));

    var embed = new RichEmbed()
        .setColor(colour.colourHex)
        .setTitle("/u/" + redditUsername)
        .setURL("https://www.reddit.com/u/" + redditUsername)
        .setDescription(discordUser)
        .setThumbnail(colour.imageUrl)
        .addField("Flair", flair, true)
        .addField("Account created", age, true)
        .addField("Karma", karma, true)
    await channel.send({ embed });
};