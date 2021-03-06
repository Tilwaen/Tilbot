exports.run = async (client, message, args, level, r, unbClient) => {
    let inputDate = new Date(args[0]);
    let botRole = message.guild.roles.find(role => role.name === "Tilbot");
    let runInLiveMode = args[1] === "kick";

    let membersWithRole = await message.guild.roles
                                                .find(role => role.name === "No Role")
                                                .members;

    // Filter out people who joined after the input date or have higher role than this bot
    let filteredMembers = membersWithRole
            .filter(member => member.joinedAt < inputDate)
            .filter(m => m.highestRole.comparePositionTo(botRole) < 0);

    var stringOfFilteredMembers = filteredMembers
                                        .map(m => m.user.tag)
                                        .join('\n');

    if (stringOfFilteredMembers.length === 0) {
        stringOfFilteredMembers = "No such users";
    }

    const msg = await message.channel.send(`Total number of users with No Role: **${membersWithRole.size}**.\nFound **${filteredMembers.size}** users with No Role who joined before *${inputDate}* to be purged.`);
    const msg2 = await message.channel.send(`${stringOfFilteredMembers}`);

    // Kick the users if running in the live mode
    if (runInLiveMode) {
        await message.reply("kick users? Confirm with 'y':");

        // The author of the message needs to confirm the selection
        const filter = response => {
            return response.author === message.author && response.content.toLowerCase() === 'y';
        }

        try {
            const collected = await message.channel.awaitMessages(filter, { maxMatches: 1, time: 120000, errors: ['time'] });
            await message.channel.send(`Kicking users. Bots will not be kicked.`);
            await filteredMembers.forEach(member => {
            if (!member.kickable) return message.reply(`I cannot kick member ${member}`);
            if (member.user.bot) return message.reply(`${member} is a bot, I will not kick it`);
            console.log(`Kicking ${member}`);
            member.kick("Purge of users with no role assigned");
        });
        } catch (time) {
            await message.channel.send('Time out, no users will be kicked.');
            return;
        }
        
    } else {
        console.log("Running in test mode, no users were kicked.");
        const msg3 = await message.channel.send(`Running in test mode, no users were kicked.`);
    }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "Oil",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "norolepurge",
  category: "Moderating",
  description: "Purges the No Role users who joined before the given date. Add the \"kick\" argument to kick the users.",
  usage: "norolepurge [yyyy-mm-dd] <kick>"
};