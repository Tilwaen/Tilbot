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

    const flairInfo = client.config.flairInfo;

    const subreddit = () => {
        switch(args[0].toLowerCase()) {
            // JS allows for switch argument fall-through
            case "red":
            case "orange":
            case "yellow":
            case "green":
            case "blue":
            case "purple":
                return flairInfo[args[0].toLowerCase()].subreddit;
            case "pink":
                return flairInfo["orange"].subreddit;
            case "mod":
            case "moderator":
            case "oil":
            case "main":
            case "flairwars":
            case "void":
                return flairInfo["mod"].subreddit;
            case "law":
            case "laws":
            case "flairlaws":
                return `Flairlaws`;
            case "pet":
            case "pets":
            case "flairpets":
                return `Flairpets`;
            case "news":
            case "flairnews":
                return `Flairnews`;
            case "onion":
            case "flaironion":
                return `Flaironion`;
            case "ssr":
            case "sixsidedrainbow":
                return `SixSidedRainbow`;
            default:
                return;
        }
    };

    if (!subreddit()) {
        await message.channel.send(`Wrong syntax. The syntax is \`${client.config.defaultSettings.prefix}sub colour\``);
        return;
    }

    await message.channel.send(`https://www.reddit.com/r/${subreddit()}`);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["subreddit"],
  permLevel: "User",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "sub",
  category: "Flairwars",
  description: "Links the FW subreddits",
  usage: "sub <colour>"
};