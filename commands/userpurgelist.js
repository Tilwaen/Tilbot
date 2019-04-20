exports.run = async (client, message, args, level) => {
    let botRole = message.guild.roles.find(role => role.name === "Tilbot");
    let runInLiveMode = args[0] === "kick";
    let reason = "Get yeghet";
    console.log("runInLiveMode: " + runInLiveMode);

    const userList = [
        "Sadcat#2999"
    ];

    const users = message.guild.members.filter(member => userList.includes(member.user.tag));
    let stringUsers = users.map(m => m.user.tag).sort().join('\n');
    const msg = await message.channel.send(`Number of users in the hardcoded list: **${userList.length}**. Number of users found through Discord: **${users.size}**`);
    const msg2 = await message.channel.send(`**Users that weren't found** (Yeet them manually):\n${userList.filter(user => !users.map(member => member.user.tag).includes(user)).join('\n')}`);
    const msg3 = await message.channel.send(`**Users to be purged:**`);
    await sendTrimmedMessage(message.channel, stringUsers);

    if (runInLiveMode) {
        console.log("Running in live mode, kicking users.");
        const msg5 = await message.channel.send(`Running in live mode, kicking users. Bots will not be kicked.`);
        await users.forEach(function(member) {
            if (!member.kickable) return message.reply(`I cannot kick member ${member}`);
            if (member.user.bot) return message.reply(`${member} is a bot, I will not kick it`);
            console.log(`Kicking ${member}`);
            member.kick(reason);
        });
    } else {
        console.log("Running in test mode, no users were kicked.");
        const msg5 = await message.channel.send(`Running in test mode, no users were kicked.`);
    }
};

async function sendTrimmedMessage(channel, content) {
    for(let i = 0; i < content.length; i += 2000) {
        const toSend = content.substring(i, Math.min(content.length, i + 2000));
        await channel.send(toSend);
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
  name: "userpurgelist",
  category: "Moderating",
  description: "Purges the users from a hardcoded list. Add the \"kick\" argument to kick the users.",
  usage: "userpurgelist <kick>"
};