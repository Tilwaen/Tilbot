const fetch = require("node-fetch");
const { RichEmbed } = require('discord.js');

module.exports = {
    /**
     * Returns a random image from a random subreddit specified by the subredditNameArray.
     * @param {snoowrap instance} r
     * @param {Array[String]} subredditNameArray
     * @return {String} URL of the image
     */
    getSubredditImage: async function(r, subredditNameArray) {
        const subredditChoice = getRandomEntry(subredditNameArray);

        // Try to fetch random submission first, not dependent on the hot page
        const limit = 10;
        var numberOfTries = 0;
        do {
            const post = await r.getSubreddit(subredditChoice).getRandomSubmission();
            const allowed = post.post_hint === 'image' && !post.over_18;
            if (allowed) return post.url;
            numberOfTries++;
        } while (numberOfTries < limit);

        // Random submission failed; fetch data from the hotpage
        const data = await fetch(`https://www.reddit.com/r/${subredditChoice}/hot/.json?limit=100`).catch(console.error);
        const json = await data.json();
        const posts = json.data.children;
        const allowedPosts = posts.filter(post => !post.data.over_18 && post.data.post_hint === 'image')
        const randomPost = getRandomEntry(allowedPosts);
        return randomPost.data.url;
    },

    /**
     * Returns a random image from a random subreddit specified by the subredditNameArray, together with a post title and author
     * @param {snoowrap instance} r
     * @param {Array[String]} subredditNameArray
     * @return {{title: title, author: author, url: imageUrl}}
     */
    getSubredditImagePost: async function(r, subredditNameArray) {
        const subredditChoice = getRandomEntry(subredditNameArray);

        // Try to fetch random submission first, not dependent on the hot page
        const limit = 10;
        var numberOfTries = 0;
        do {
            const post = await r.getSubreddit(subredditChoice).getRandomSubmission();
            const allowed = post.post_hint === 'image' && !post.over_18;
            if (allowed) return { title: post.data.title, author: post.data.author, url: post.data.url };
            numberOfTries++;
        } while (numberOfTries < limit);

        // Random submission failed; fetch data from the hotpage
        const data = await fetch(`https://www.reddit.com/r/${subredditChoice}/hot/.json?limit=100`).catch(console.error);
        const json = await data.json();
        const posts = json.data.children;
        const allowedPosts = posts.filter(post => !post.data.over_18 && post.data.post_hint === 'image')
        const randomPost = getRandomEntry(allowedPosts);
        return { title: randomPost.data.title, author: randomPost.data.author, url: randomPost.data.url };
    },

    getImageCatAPI: async function(url) {
        const data = await fetch(url).catch(console.error);
        const json = await data.json();
        return json[0].url;
    },

    sendImageEmbed: async function(channel, url) {
        var embed = new RichEmbed()
            .setImage(url)
            .setColor(0xC9DDFF)
        let msg = await channel.send({ embed });
    },

    sendImageEmbedWithAuthor: async function(channel, url, author) {
        var embed = new RichEmbed()
            .setTitle("From /u/" + author)
            .setImage(url)
            .setColor(0xC9DDFF)
        let msg = await channel.send({ embed });
    }
};

function getRandomEntry(collection) {
    const index = Math.floor(Math.random() * collection.length);
    return collection[index];
}