const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args, level, r, unbClient) => {
    if (args.length === 0) {
        message.channel.send('You forgot to include the category name. The correct syntax is `archivepoll <channel category name>`.');
        return;
    }

    const modCategoryID = `463799764178305055`;
    const categoryName = args.join(' ');
    const category = message.guild.channels
            .filter(channel => channel.parent)  // Filter out channels that have a category
            .map(channel => channel.parent)
            .filter(category => category.id !== modCategoryID)
            .find(category => category.name.toLowerCase().includes(categoryName.toLowerCase()));

    if (!category) {
        message.channel.send(`Incorrect category name: \`${categoryName}\``);
        return;
    }

    await message.channel.send(`--------------------\n**${category.name}**\n--------------------`);

    for (var [channelID, channel] of category.children) {
        const msg = await message.channel.send(`Archive channel ${channel}?`);
        await msg.react("👍");
        await msg.react("👎");
        await msg.react("🤷");
    }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["pollarchive"],
  permLevel: "Oil",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "archivepoll",
  category: "Miscelaneous",
  description: "Create simple polls (upvote/downvote/shrug) to archive each channel of the given category.",
  usage: "archivepoll <channel category name>"
};