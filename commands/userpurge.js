exports.run = async (client, message, args, level, r, unbClient) => {
    let inputDate = new Date(args[0]);
    let botRole = message.guild.roles.find(role => role.name === "Tilbot");
    let runInLiveMode = args[1] === "kick";
    console.log("runInLiveMode: " + runInLiveMode);

    var map = new Map();

    // Get all the guild text channels
    let channels = message.guild.channels
                                    .filter(c => c.type === "text")
                                    .array();
    var msg = await message.channel.send(`Number of channels: ${channels.length}\nProcessing channels...\n`);

    for (const channel of channels) {
        console.log(`Processing channel ${channel.name}`);
        /*msg = */await msg.edit(`${msg.content}\n#${channel.name}`).catch(console.error);
        await processChannel(channel, map, inputDate);
    }

    console.log("Number of users found in the channels: " + map.size);

    let usersNotFound = message.guild.members
            .filter(m => m.highestRole.comparePositionTo(botRole) < 0)
            .filter(member => !map.has(member.user.id));
    let usersNotFoundButNotKickable = message.guild.members
            .filter(m => m.highestRole.comparePositionTo(botRole) >= 0)
            .filter(member => !map.has(member.user.id));
    let usersFound = message.guild.members
            //.filter(m => m.highestRole.comparePositionTo(botRole) < 0)
            .filter(member => map.has(member.user.id));

    let stringUsersNotFound = usersNotFound.map(m => m.user.tag).sort().join('\n');
    let stringUsersNotFoundButNotKickable = usersNotFoundButNotKickable.map(m => m.user.tag).sort().join('\n');
    let stringUsersFound = usersFound.map(m => m.user.tag).sort().join('\n');

    if (stringUsersNotFound.length === 0) {
        stringUsersNotFound = "No such users";
    }
    if (stringUsersFound.length === 0) {
        stringUsersFound = "No such users";
    }

    console.log(`Total number of users: ${message.guild.memberCount}.\nNumber of users last active before ${inputDate} to be purged: ${usersNotFound.size}.\nNumber of users that will be left: ${usersFound.size}.`);
    await message.channel.send(`Total number of users: **${message.guild.memberCount}**.\nNumber of users last active before *${inputDate}* to be purged: **${usersNotFound.size}**.\nNumber of users that will be left: **${usersFound.size}**.`);
    await message.channel.send(`**Users to be purged:**`);
    await sendTrimmedMessage(message.channel, stringUsersNotFound);
    if (usersNotFoundButNotKickable.size > 0) {
        await message.channel.send(`**Users that aren't active but can't be kicked by this bot:**\n${stringUsersNotFoundButNotKickable}`);
    }

    // Kick the users if running in a live mode
    if (runInLiveMode) {
        await message.reply("kick users? Confirm with 'y':");

        // The author of the message needs to confirm the selection
        const filter = response => {
            return response.author === message.author && response.content.toLowerCase() === 'y';
        }

        try {
            const collected = await message.channel.awaitMessages(filter, { maxMatches: 1, time: 120000, errors: ['time'] });
            await message.channel.send(`Kicking users. Bots will not be kicked.`);
            await usersNotFound.forEach(member => {
                if (!member.kickable) return message.reply(`I cannot kick member ${member}`);
                if (member.user.bot) return message.reply(`${member} is a bot, I will not kick it`);
                console.log(`Kicking ${member}`);
                member.kick("Purge of inactive users");
            });
        } catch (time) {
            await message.channel.send('Time out, no users will be kicked.');
            return;
        }
    } else {
        console.log("Running in test mode, no users were kicked.");
        await message.channel.send(`Running in test mode, no users were kicked.`);
    }
};

async function processChannel(channel, map, inputDate) {
    let last_id;

    console.log("In channel: " + channel.name);

    while (true) {
        // We can only process at most 100 messages ;-; so we need to paginate
        const options = { limit: 100 };
        // ID od the last message (unless it's the first batch of messages
        if (last_id) {
            options.before = last_id;
        }

        const messages = await channel.fetchMessages(options);

        for (const message of messages.array()) {
            // Found earlier date, stop searching in this channel
            if (message.createdAt <= inputDate) {
                break;
            }

            // Found a new person who we don't have saved yet
            if (!map.has(message.author.id)) {
                map.set(message.author.id, message.createdAt);
            }
        }

        if (messages.size !== 100 || messages.last().createdAt <= inputDate) {
            break;
        }

        last_id = messages.last().id;
    }
};

async function sendTrimmedMessage(channel, content) {
    for(let i = 0; i < content.length; i += 2000) {
        const toSend = content.substring(i, Math.min(content.length, i + 2000));
        await channel.send(toSend);
    }
}

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
  name: "userpurge",
  category: "Moderating",
  description: "Purges the users who have been inactive since the given date. Add the \"kick\" argument to kick the users.",
  usage: "userpurge [yyyy-mm-dd] <kick>"
};