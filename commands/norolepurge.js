exports.run = async (client, message, args, level) => {
    let inputDate = new Date(args[0]);
    let botRole = message.guild.roles.find(role => role.name === "Tilbot");
    let runInLiveMode = args[1] === "kick";
    console.log("runInLiveMode: " + runInLiveMode);

    let membersWithRole = await message.guild.roles.find(role => role.name === "No Role").members;

    let filteredMembers = membersWithRole
            .filter(member => member.joinedAt < inputDate)
            .filter(m => m.highestRole.comparePositionTo(botRole) < 0);
    //const filteredList = filteredMembers.forEach(m => console.log(`${m.user.tag}, joined ${m.joinedAt}`));

    var stringOfFilteredMembers = filteredMembers.map(m => m.user.tag).join('\n');
    if (stringOfFilteredMembers.length === 0) {
        stringOfFilteredMembers = "No such users";
    }

    console.log(`Total number of users with No Role: ${membersWithRole.size}. Found ${filteredMembers.size} users with No Role who joined before ${inputDate} to be purged.`);
    const msg = await message.channel.send(`Total number of users with No Role: ${membersWithRole.size}. Found ${filteredMembers.size} users with No Role who joined before ${inputDate} to be purged.`);
    const msg2 = await message.channel.send(`${stringOfFilteredMembers}`);

    if (runInLiveMode) {
        console.log("Running in live mode, kicking users.");
        const msg3 = await message.channel.send(`Running in live mode, kicking users.`);
        await filteredMembers.forEach(function(member) {
            if (!member.kickable) return message.reply(`I cannot kick member ${member}`);
            console.log(`Kicking ${member}`);
            member.kick("Purge of users with no role assigned");
        });
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