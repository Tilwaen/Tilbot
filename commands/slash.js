exports.run = async (client, message, args, level, r, unbClient) => {
    // Megaserver
    const role1ID = "563611117302185984";
    const role2ID = "563611176370569216";

    if (!message.member.roles.some(r => ["Single slash", "Double slash"].includes(r.name))) {
        const coinflip = Math.round(Math.random());

        const roleID = (coinflip === 0) ? role1ID : role2ID;
        const role = message.guild.roles.get(roleID);

        if (!role) {
            const msg = await message.channel.send(`Didn't find role with id ${roleID}`);
            const msg2 = await message.channel.send(`Role ID 1: ${role1ID}, role ID 2: ${role2ID}`);
            return;
        }

        if (!message.member.nickname) {
            const msg = await message.channel.send(`You don't have a username, I won't assign the role to you.`);
            console.log(`The user doesn't have a username.`);
            return;
        }
        if (!message.member.nickname.startsWith('/u/')) {
            const msg = await message.channel.send(`Your username doesn't start with /u/, I won't assign the role to you.`);
            console.log(`The username doesn't start with /u/.`);
            return;
        }

        await message.member.addRole(role).catch(console.error);

        const nickname = message.member.nickname.split('/u/').slice(1);
        const newNickname = (coinflip === 0) ? 'u/' + nickname : '\\u/' + nickname;
        await message.member.setNickname(newNickname).catch(console.error);

        console.log(`Assigning new role: ${role.name}, nickname: ${newNickname}`);
        const msg = await message.channel.send(`Assigned role: ${role}`);

        console.log(`nickname: ${nickname}`);
    } else {
        console.log(`Already roled`);
        const msg = await message.channel.send(`You are already roled`);
    }
};

exports.conf = {
  enabled: false,
  guildOnly: true,
  aliases: [],
  permLevel: "User",
  channelPerms: "Fun",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "slash",
  category: "Miscelaneous",
  description: "Get assigned a fancy role!",
  usage: "slash"
};