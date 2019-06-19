const { RichEmbed } = require('discord.js');
const reddit = require('../functions/redditFunctions.js');
const util = require('../functions/util.js');

exports.run = async (client, message, args, level, r, unbClient) => {
    if (args.length !== 1) {
        await message.channel.send("Please specify a Reddit account");
        return;
    }

    const username = util.getRedditUsernameFromArg(args);

    var redditUser;
    // Get the Reddit user and check their flair on the main subreddit
    try {
        redditUser = await r.getUser(username).fetch();
    } catch (error) {
        message.channel.send("This is not a valid Reddit account: https://www.reddit.com/u/" + username);
        return;
    };

    let flair = await reddit.getFlair(r, username);
    let colourInfo = reddit.getColourInfoFromFlair(client, flair);
    const totalKarma = redditUser.link_karma + redditUser.comment_karma;

    var msg, userPosts, userComments;

    try {
        msg = await message.channel.send("Fetching user posts...");
        userPosts = await reddit.getUserSubmissions(username, "submission");
        msg = await msg.edit("Fetching user comments...");
        userComments = await reddit.getUserSubmissions(username, "comment");
    } catch (error) {
        message.channel.send("An error occurred while doing the command: " + error);
        return;
    };

    msg = await msg.edit("Processing data...");
    const flairInfo = client.config.flairInfo;
    const mainPosts = getSubmissions(userPosts, 'flairwars');
    const mainComments = getSubmissions(userComments, 'flairwars');
    const totalScore = userPosts.map(post => post.score).reduce((a, v) => a + v)
                     + userComments.map(post => post.score).reduce((a, v) => a + v);

    var fwRelated = {
        "posts": [],
        "comments": [],
        "postKarma": 0,
        "commentKarma": 0
    };

    var embed = new RichEmbed()
        .setTitle("Karma of /u/" + username)
        .setColor(colourInfo.colourHex)
        .addField(`Main subreddit`, computeStats(mainPosts, mainComments, userPosts, userComments, totalScore, fwRelated))
        .addBlankField();

    client.config.colours.forEach(colour => {
        const posts = getSubmissions(userPosts, flairInfo[colour.toLowerCase()].subreddit);
        const comments = getSubmissions(userComments, flairInfo[colour.toLowerCase()].subreddit);
        embed.addField(`${colour}`, computeStats(posts, comments, userPosts, userComments, totalScore, fwRelated));
    });

    const otherSubredditsPosts = userPosts.filter(post => client.config.relatedSubreddits
                                                                        .map(subreddit => subreddit.toLowerCase())
                                                                        .indexOf(post.subreddit.toLowerCase()) > -1);
    const otherSubredditsComments = userComments.filter(comment => client.config.relatedSubreddits
                                                                        .map(subreddit => subreddit.toLowerCase())
                                                                        .indexOf(comment.subreddit.toLowerCase()) > -1);
    embed.addField(`Other related FW subreddits`, computeStats(otherSubredditsPosts, otherSubredditsComments, userPosts, userComments, totalScore, fwRelated));

    const postKarma = getKarma(fwRelated.posts);
    const commentKarma = getKarma(fwRelated.comments);

    embed
        .addBlankField()
        .addField(`Total`,
`Total number of Flairwars posts: ${fwRelated.posts.length}/${userPosts.length}${fwRelated.posts.length > 0 ? ` (${getPerc(fwRelated.posts.length, userPosts.length)}% of all posts)` : ""}
Total Flairwars post score: ${postKarma}${postKarma > 0 ? ` (${getPerc(postKarma, totalKarma)}% of all score)` : ""}
Total number of Flairwars comments: ${fwRelated.comments.length}/${userComments.length}${fwRelated.comments.length > 0 ? ` (${getPerc(fwRelated.comments.length, userComments.length)}% of all comments)` : ""}
Total Flairwars comment score: ${commentKarma}${commentKarma > 0 ? ` (${getPerc(commentKarma, totalKarma)}% of all score)` : ""}
Total Flairwars post and comment score summed: ${fwRelated.postKarma + fwRelated.commentKarma}
Total post score from all the Reddit posts: ${totalScore}
Displayed user karma (computed from the score): ${totalKarma}`);

    msg = await msg.edit({ embed });
};

function getSubmissions(arrayOfPosts, subreddit) {
    return arrayOfPosts.filter(post => post.subreddit.toLowerCase() === subreddit.toLowerCase());
};

function getKarma(arrayOfPosts) {
    return arrayOfPosts.length > 0 ? arrayOfPosts.map(post => post.score).reduce((a, v) => a + v) : 0;
};

function getPerc(value, totalValue) {
    const result = util.roundFloat(value / totalValue * 100);
    return result > 10 ? `**${result}**` : `${result}`;
};

function computeStats(posts, comments, userPosts, userComments, totalKarma, fwRelated) {
    var postKarma, commentKarma;

    postKarma = getKarma(posts);
    commentKarma = getKarma(comments);

    fwRelated.posts = fwRelated.posts.concat(posts);
    fwRelated.comments = fwRelated.comments.concat(comments);
    fwRelated.postKarma += postKarma;
    fwRelated.commentKarma += commentKarma;

    return `Posts: ${posts.length}${posts.length > 0 ? ` (${getPerc(posts.length, userPosts.length)}% of all posts)` : ""}
Post score: ${postKarma}${postKarma > 0 ? ` (${getPerc(postKarma, totalKarma)}% of all score)` : ""}
Comments: ${comments.length}${comments.length > 0 ? ` (${getPerc(comments.length, userComments.length)}% of all comments)` : ""}
Comment score: ${commentKarma}${commentKarma > 0 ? ` (${getPerc(commentKarma, totalKarma)}% of all score)` : ""}`;
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["karma", "posts", "fwposts", "fwinfo", "fwscore", "score"],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "fwkarma",
  category: "Miscelaneous",
  description: "Counts how much karma the user gained or lost on the FW related subreddits.",
  usage: "fwkarma <user>"
};
