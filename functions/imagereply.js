const fetch = require("node-fetch");
const { RichEmbed } = require('discord.js');

module.exports = {
    getImage: async function(subredditNameArray) {
        const subredditChoice = getRandomEntry(subredditNameArray);
        const data = await fetch(`https://www.reddit.com/r/${subredditChoice}.json`).catch(console.error);
        const json = await data.json();
        const posts = json.data.children;
        const allowedPosts = posts.filter(post => !post.data.over_18 && post.data.post_hint === 'image')
        const randomPost = getRandomEntry(allowedPosts);
        return randomPost.data.url;
    },

    sendImageEmbed: async function(channel, url) {
        var embed = new RichEmbed()
            .setImage(url)
            .setColor(0xC9DDFF)
        let msg = await channel.send({ embed });
    }
};

function getRandomEntry(collection) {
    const index = Math.floor(Math.random() * collection.length);
    return collection[index];
}