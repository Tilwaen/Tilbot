exports.run = async (client, message, args, level, r, unbClient) => {
    // No arguments passed
    if (args.length === 0) {
        await message.channel.send("Please specify a colour");
        return;
    }

    if (args[0].startsWith('r/')) {
        await message.channel.send("Please specify a colour, not a subreddit");
        return;
    }

    const colours = client.config.colours;
    var colourSubreddit;

    // If the input is a colour (defined in client.config.colours) - excluding mods, for example
    if (colours.some(colour => colour.toLowerCase() === args[0].toLowerCase())) {
        colourSubreddit = client.config.flairInfo[args[0].toLowerCase()].subreddit;
    } else if (args[0].toLowerCase() === "pink") {
        colourSubreddit = client.config.flairInfo["orange"].subreddit;
    } else {
        await message.channel.send("Wrong syntax. The syntax is \`~count [colour]\`");
        return;
    }

    // Yaml syntax highlighting for that shiny turqouise colour header
    text = `\`\`\`yaml\n${colourSubreddit}\`\`\`\n`;
    var msg = await message.channel.send("Counting...");

    const flairs = client.config.flairs;
    const numberOfHotPages = 5;
    // This is an identifier of the last post on the page
    var after = 0;

    for (var i = 1; i <= numberOfHotPages; i++) {
        msg = await msg.edit(text + i + ". page, fetching data");
        const posts = await getHotPage(r, colourSubreddit, after);
        msg = await msg.edit(text + i + ". page, verifying user flairs");

        // Create an array of post authors from the array of posts
        const authorsPerPage = posts.map(post => post.author.name);
        // This all is to reduce the amount of Reddit API requests - remove duplicate authors from the array
        const uniqueAuthorsPerPage = [...new Set(authorsPerPage)];
        const flairMap = new Map();
        // For each unique author on the current hot page, check their flair on the main sub
        // and save it into the map (with the author being the map key); (map ~ dictionary structure)
        for (var author of uniqueAuthorsPerPage) {
            const flair = await r.getSubreddit("flairwars").getUserFlair(author);
            // If the user doesn't have any flair assigned on the main subreddit,
            // let's say that they have the "None" flair
            if (!flair.flair_text) {
                flairMap.set(author, 'None');
                continue;
            }
            // Unifies the seasonal flairs; for example, 'Yellow II', 'Yellow I' and 'Yellow'
            // are all compared to just 'Yellow'
            const flairColour = flairs.filter(flairText => flair.flair_text.includes(flairText))[0];
            // Replace this unified flair as the map value under the author key
            flairMap.set(author, flairColour);
        }

        msg = await msg.edit(text + i + ". page, mapping users to flairs");
        // Remember that array of post authors per hot page? Let's transform it to an array of colour flairs now
        const flairsFromAuthors = authorsPerPage.map(author => flairMap.get(author));

        text = text + `**Number of posts on the ${i}. page:**\n`;
        // Count the number of occurrences for each colour
        flairs.forEach(colour => {
            const numberOfColourPosts = flairsFromAuthors.filter(flair => flair === colour).length;
            if (numberOfColourPosts > 0) {
                text = `${text}**${colour}:** ${numberOfColourPosts}\n`;
            }
        });

        text = text + '\n';
        msg = await msg.edit(text);
        // Update the variable which stores the last post to fetch the next hotpage
        after = posts[posts.length - 1].name;
    }
};

async function getHotPage(r, subreddit, after) {
    // Stickied posts are fetched, but don't count toward the 25 posts limit
    // Limit: how many posts; after: the last previous post (after = 0 fetches from the start)
    return await r.getSubreddit(subreddit)
                        .getHot({ limit: 25, after: after })
                        .filter(post => !post.stickied);
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
  usage: "count [colour]"
};