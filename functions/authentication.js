const { RichEmbed } = require('discord.js');

/*
 * Is launched from the ../oauth/server.js after the authentication request is intercepted
 */
module.exports = {
    authSuccess: async function (client, r, authReq, response, state) {
        const userID = Buffer.from(state, 'base64').toString('ascii');
        const message = authReq.get(userID);
        authReq.delete(userID);

        if (!message) {
            const user = await client.fetchUser(userID);
            await user.send("You took too long to authenticate. Try to do the command again or contact any human (mini)mod to get your role assigned.");
            return;
        }

        // Parse the username, karma and age
        const discordUser = message.author;
        const redditUsername = response.data.name;
        const karma = response.data.link_karma + response.data.comment_karma;
        const accountCreated = response.data.created_utc;
        const age = new Date(accountCreated * 1000).toDateString();

        // Get the user's flair
        var userFlair;
        try {
            userFlair = await r.getSubreddit('flairwars').getUserFlair(redditUsername);
        } catch (error) {
            await message.channel.send("This is not a valid Reddit account: https://www.reddit.com/u/" + redditUsername);
            return;
        };
        // Split at space and take the first part because of the totem season ticks (filter only the colour)
        let flair = userFlair.flair_text ? userFlair.flair_text.split(' ')[0] : 'None';

        // Send the user info embed to the channel where the user did the command
        await sendRedditUserEmbed(message.channel, discordUser, redditUsername, flair, karma, age);

        // Change the user's username (needs to be done on the guild member, not user, as the username is guild specific)
        const guildMember = message.member;
        await guildMember.setNickname('/u/' + redditUsername);

        // If they don't have any flair, let them assign a flair first
        const megathreadLink = 'https://www.reddit.com/r/flairwars/comments/bavhvo/comment_to_gain_a_team_megathread/';
        if (flair === 'None') {
            await message.reply(`you don't have any flair assigned on the subreddit yet. Please leave a comment under the Megathread to get your colour assigned. You cannot choose the colour, the flair distribution process is automatic and random. May you get assigned to the best team!\n\n${megathreadLink}`);
            return;
        }

        if (flair === 'Mod' || flair === 'Ex Mod') {
            await message.reply(`Welcome back <3 I can't give you your roles. Wait for a human, please.`);
            return;
        }

        const colourRole = message.guild.roles.find(role => role.name === flair);
        if (!colourRole) {
            await message.channel.send(`Error: Didn't find a role with name \`${flair}\``);
            return;
        }

        // Check the karma and age limits
        const karmaLimit = client.config.oauth.karmaLimit;
        const ageLimit = client.config.oauth.accountAgeLimitDays;

        const now = new Date().getTime() / 1000;  // ms
        const ageInDays = (now - accountCreated)/60/60/24; // s/min/hours

        // The karma and age are not sufficient
        if (karma < karmaLimit || ageInDays < ageLimit) {
            message.reply(`your account is either too new or has too litte karma to be let in automatically. A human minimod of your colour (${flair}) has been notified and will be with you as soon as they can. Please be patient.`);
            // Send an embed to the need-role channel
            const needRoleChannel = message.guild.channels.get(client.config.oauth.needRolesChannelID);
            if (!needRoleChannel) {
                await message.channel.send(`Error: Could not find the channel with ID ${client.config.oauth.needRolesChannelID} to log this event and notify the minimods that this user needs their attention; please tell the bot admins to solve this mess.`);
                return;
            }
            await sendRedditUserEmbed(needRoleChannel, discordUser, redditUsername, flair, karma, age);

            // Ping the colour role in the logging channel instead of the minimods
            // (see the older version of this code for that)
            // so that the mods don't need to change the code each time when a new minimod is selected

            // Enable/disable the role ping
            const colourRoleWasMentionable = colourRole.mentionable;
            if (!colourRoleWasMentionable) colourRole.setMentionable(true);
            await needRoleChannel.send(colourRole.toString());
            if (!colourRoleWasMentionable) colourRole.setMentionable(false);

            return;
        }

        // Assign the colour and take the No Role
        const noRoleRole = message.guild.roles.find(role => role.name === client.config.defaultSettings.noRole);
        await guildMember.addRole(colourRole);
        await guildMember.removeRole(noRoleRole);
        // Give Blues the Freedmen role too
        if (colourRole.name === 'Blue') {
            const freedmenRole = message.guild.roles.find(role => role.name === 'Freedmen');
            if (freedmenRole) {
                await guildMember.addRole(freedmenRole);
            }
        }

        // Send the embed to the logging channel that the user was let in automatically
        const loggingChannel = message.guild.channels.get(client.config.oauth.botAuthLoggingChannelID);
        if (!loggingChannel) {
            await message.channel.send(`Error: Could not find the channel with ID ${client.config.oauth.botAuthLoggingChannelID} to log that this user has been let into the server automatically; please tell the bot admins to solve this mess.`);
            return;
        }
        await sendRedditUserEmbed(loggingChannel, discordUser, redditUsername, flair, karma, age, `User was let in automatically`, `${discordUser}\n[${redditUsername}](https://www.reddit.com/u/${redditUsername})`);

        // Welcome the person in their colour general channel
        // Get the colour general channel
        const colourGeneralChannel = message.guild.channels.find(channel => channel.name === `${flair.toLowerCase()}-general`);
        if (!colourGeneralChannel) {
            await loggingChannel.send(`Error: Could not find the channel with name ${flair.toLowerCase()}-general welcome this user to their colour.`);
            return;
        }
        // Get welcome role
        const welcomeRole = message.guild.roles.get(client.config.oauth.welcomeRoleID);
        if (!welcomeRole) {
            await loggingChannel.send(`Error: Could not find the welcome role with ID: ${client.config.oauth.welcomeRoleID}.`);
            return;
        }
        // Get the welcome message
        var welcomeMessage = client.config.oauth.welcomeMessage;
        if (!welcomeMessage) {
            await loggingChannel.send(`Error: Could not load the welcome message to welcome user in ${colourGeneralChannel}.`);
            return;
        }
        welcomeMessage = welcomeMessage.replace("{{user}}", discordUser);
        welcomeMessage = welcomeMessage.replace("{{colour}}", flair);
        // Append the server link if the colour has any
        const colourServerInviteLink = client.config.flairInfo[flair.toLowerCase()].serverInvite;
        if (colourServerInviteLink) {
            welcomeMessage = welcomeMessage + ` and don't forget to join the ${flair} server: ${colourServerInviteLink}!`;
        }
        welcomeMessage = `${welcomeMessage}\n${welcomeRole}`;
        // Send the welcome message
        await colourGeneralChannel.send(welcomeMessage);
    },
    authFailure: async function (client, r, authReq, response, state) {
        const userID = Buffer.from(state, 'base64').toString('ascii');
        const message = authReq.get(userID);
        authReq.delete(userID);

        if (!message) {
            const user = await client.fetchUser(userID);
            user.send("The authentication wasn't successful. Try to do the command again or contact any human (mini)mod to get your role assigned.");
        } else {
            message.reply("The authentication wasn't successful.");
        }
    }
};

async function sendRedditUserEmbed(channel, discordUser, redditUsername, flair, karma, age, title, description) {
    let colours = [
        { name: "Red", imageUrl: "https://i.imgur.com/SChaKoz.jpg", colourHex: "#AF0303" },
        { name: "Orange", imageUrl: "https://i.imgur.com/CewHt0f.png", colourHex: "#F99A0C" },
        { name: "Yellow", imageUrl: "https://i.imgur.com/835G1zP.jpg", colourHex: "#FFE500" },
        { name: "Green", imageUrl: "https://i.imgur.com/MNKwjES.jpg", colourHex: "#3ACE04" },
        { name: "Blue", imageUrl: "https://i.imgur.com/8AJrVmx.png", colourHex: "#213AEF" },
        { name: "Purple", imageUrl: "https://i.imgur.com/rZFSCIP.jpg", colourHex: "#AF0ECC" },
        { name: "Mod", imageUrl: "https://i.imgur.com/Z0AM4lA.png", colourHex: "#C9DDFF" },
        { name: "Ex Mod", imageUrl: "https://i.imgur.com/Z0AM4lA.png", colourHex: "#C9DDFF" },
        { name: "None", imageUrl: "https://i.imgur.com/dmJbwoN.png", colourHex: "#C9DDFF" }
    ];

    let colour = colours.find(colour => flair.includes(colour.name));

    var embed = new RichEmbed();

    if (!title) {
        embed.setURL("https://www.reddit.com/u/" + redditUsername)
        title = "/u/" + redditUsername;
    }
    // Love the ternary operator syntax :kek: This means if the description is set,
    // use it, otherwise use discordUser as the description
    description = description ? description : discordUser;

    embed.setColor(colour.colourHex)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(colour.imageUrl)
        .addField("Flair", flair, true)
        .addField("Account created", age, true)
        .addField("Karma", karma, true);

    await channel.send({ embed });
};