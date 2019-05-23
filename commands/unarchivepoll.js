const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args, level, r, unbClient) => {
    // No category name specified
    if (args.length === 0) {
        message.channel.send('You forgot to include the category name. The correct syntax is `unarchivepoll <channel category name>`.');
        return;
    }

    // Find the category that includes the given word
    const modCategoryID = `463799764178305055`;
    const categoryName = args.join(' ');
    const category = message.guild.channels
            .filter(channel => channel.parent)  // Filter out channels that have a category
            .map(channel => channel.parent)
            .filter(category => category.id !== modCategoryID)
            .find(category => category.name.toLowerCase().includes(categoryName.toLowerCase()));

    // No category including that word found
    if (!category) {
        message.channel.send(`Incorrect category name: \`${categoryName}\``);
        return;
    }

    await message.channel.send(`--------------------\n**${category.name}**\n--------------------`);
    // Sorts the channels in the category by name
    // .localeCompare() compares strings for equality
    const channels = new Map([...category.children.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)));

    // React to each channel in the category with thumbsup, thumbsdown and shrug
    for (var [channelID, channel] of channels) {
        const msg = await message.channel.send(`Unarchive channel ${channel}?`);
        await msg.react("👍");   // thumbsup
        await msg.react("👎");   // thumbsdown
        await msg.react("🤷");   // shrug
    }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["pollunarchive"],
  permLevel: "Oil",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "unarchivepoll",
  category: "Moderating",
  description: "Create simple polls (upvote/downvote/shrug) to unarchive each channel of the given category.",
  usage: "unarchivepoll <channel category name>"
};