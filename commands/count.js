const fetch = require("node-fetch");

exports.run = async (client, message, args, level, r) => {
    if (args.length === 0) {
        await message.channel.send("Please specify a colour");
        return;
    }

    if (args[0].startsWith('r/')) {
        await message.channel.send("Please specify a colour, not a subreddit");
        return;
    }

    const colours = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Mod"];
    var colourSubreddit;

    switch (args[0].toLowerCase()) {
        case "red": colourSubreddit = "DSRRed"; break;
        case "pink":
        case "orange": colourSubreddit = "TheOrangeArmyHQ"; break;
        case "yellow": colourSubreddit = "YellowOnlineUnion"; break;
        case "green": colourSubreddit = "TheGreenArmy"; break;
        case "blue": colourSubreddit = "UnitedBlueRepublic"; break;
        case "purple": colourSubreddit = "PurpleImperium"; break;
        default:    await message.channel.send("Wrong syntax. The syntax is \`~count colour\`");
                    return;
    }

    text = `\`\`\`yaml\n${colourSubreddit}\`\`\`\n`;
    var msg = await message.channel.send("Counting...");

    const numberOfHotPages = 5;
    var after = 0;

    for (var i = 1; i <= numberOfHotPages; i++) {
        msg = await msg.edit(text + i + ". page, fetching data");
        const posts = await getHotPage(r, colourSubreddit, after);
        msg = await msg.edit(text + i + ". page, verifying user flairs");

        const authorsPerPage = posts.map(post => post.author.name);
        // This all is to reduce the amount of Reddit API requests
        const uniqueAuthorsPerPage = [...new Set(authorsPerPage)];
        const flairMap = new Map();
        for (var author of uniqueAuthorsPerPage) {
            const flair = await r.getSubreddit("flairwars").getUserFlair(author);
            // Unifies the seasonal flairs; for example, 'Yellow II', 'Yellow I' and 'Yellow'
            const flairColour = colours.filter(colour => flair.flair_text.includes(colour))[0];
            flairMap.set(author, flairColour);
        }

        msg = await msg.edit(text + i + ". page, mapping users to flairs");
        const flairsFromAuthors = authorsPerPage.map(author => flairMap.get(author));

        text = text + `**Number of posts on the ${i}. page:**\n`;
        colours.forEach(colour => {
            const numberOfColourPosts = flairsFromAuthors.filter(flair => flair === colour).length;
            if (numberOfColourPosts > 0) {
                text = `${text}**${colour}:** ${numberOfColourPosts}\n`;
            }
        });

        text = text + '\n';
        msg = await msg.edit(text);
        after = posts[posts.length - 1].name;
    }
};

/*async function getHotPage(subreddit) {
    const data = await fetch(`https://www.reddit.com/r/${subreddit}/hot/.json?limit=25`).catch(console.error);
    const json = await data.json();
    console.log(json.data.children);
    return json.data.children.filter(post => !post.data.stickied);
}*/

async function getHotPage(r, subreddit, after) {
    return await r.getSubreddit(subreddit).getHot({ limit: 25, after: after }).filter(post => !post.stickied);
}

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["countposts"],
  permLevel: "User",
  channelPerms: "Diplo",
  userCooldown: false,
  globalCooldown: true,
  cooldownDuration: 30
};

exports.help = {
  name: "count",
  category: "Flairwars",
  description: "Counts number of posts per hot page for the given colour subreddit. 30 seconds global cooldown.",
  usage: "count <colour>"
};