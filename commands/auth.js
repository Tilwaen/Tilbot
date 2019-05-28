const authentication = require('../functions/authentication.js');
const redditEmbed = require('../functions/redditEmbed.js');
const redditFlair = require('../functions/redditFlair.js');

exports.run = async (client, message, args, level, r, unbClient) => {

    // A minimod/mod run this command to let someone (mention) in and to get them welcomed
    if (message.member.roles.find(role => (role.name === client.config.defaultSettings.minimodRole
                                        || role.name === client.config.defaultSettings.adminRole))) {
        await minimodLetUserIn(client, message, args, r);
        return;
    }

    // If the user doesn't have No Role, they probably don't need to do this command in the first place
    if (!message.member.roles.find(role => role.name === client.config.defaultSettings.noRole)) {
        message.reply("you already have your colour role assigned!");
        return;
    }

    // Send the auth link to their DMs
    const usernameBase64 = Buffer.from(message.author.id).toString('base64');
    message.author.send(`Please authenticate your Reddit account through the link below. **We do not gain any sensitive data about your account**, all we do is verify that you're not claiming to be someone else.\n\nhttps://www.reddit.com/api/v1/authorize?client_id=${client.config.redditAuth.clientID}&response_type=code&state=${usernameBase64}&redirect_uri=${client.config.oauth.redirectUri}&duration=temporary&scope=identity`);
    message.reply("check your DMs!");

    // Now we need to wait for the GET request from Reddit
    // See ../oauth/server.js for the server request interception
    // and ../functions/authentication.js for processing it
};

async function minimodLetUserIn(client, message, args, r) {
    const member = message.mentions.members.first();
    if (!member) {
        await message.channel.send("Please mention the user that you want to let in.");
        return;
    }

    if (!member.nickname) {
        await message.channel.send("The user doesn't have a username set.");
        return;
    }

    if (!member.nickname.include("/u/")) {
        await message.channel.send("Please use this command only on users who have their usernames set according to the /u/redditAccount naming convention.");
        return;
    }

    let prefixRegex = /\/?u\//;
    // Filters out the possible /u/ or u/ prefix, as well as an empty string after the split
    // Simply put, this extracts the username from the input
    let redditUsername = member.nickname.split(prefixRegex).filter(Boolean)[0];

    var redditUser;

    try {
        redditUser = await r.getUser(redditUsername).fetch();
    } catch (error) {
        message.channel.send("I tried to fetch the Reddit user based on their username, but this is not a valid Reddit account: <https://www.reddit.com/u/" + redditUsername + ">.");
        return;
    };

    const subredditFlair = await redditFlair.getFlair(r, redditUsername);
    const colourInfo = redditFlair.getColourInfoFromFlair(client, subredditFlair);
    const flair = colourInfo.name;

    if (flair === 'None') {
        await message.channel.send(`User *${redditUsername}* doesn't have any flair on r/flairwars.`);
        return;
    }

    if (flair === 'Mod' || flair === 'Ex Mod') {
        await message.reply(`nice try, but you can't authenticate moderators.`);
        return;
    }

    // Find Discord colour role
    const colourRole = message.guild.roles.find(role => role.name === flair);
    if (!colourRole) {
        await message.channel.send(`Error: Didn't find a role with name \`${flair}\``);
        return;
    }

    // Get karma and account age
    const karma = redditUser.link_karma + redditUser.comment_karma;
    const accountCreated = redditUser.created_utc;
    const age = new Date(accountCreated * 1000).toDateString();

    const now = new Date().getTime() / 1000;  // ms
    const ageInDays = (now - accountCreated)/60/60/24; // s/min/hours

    await authentication.letUserIn(client, message, member,
                        colourRole, colourInfo,
                        redditUsername, karma, age,
                        `User was let in by minimod ${message.author}`);

    await message.react('👌');   // :ok_hand:
    return;
}

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["authenticate", "giverole", "getrole"],
  permLevel: "User",
  channelPerms: "All",
  userCooldown: false,
  globalCooldown: false,
  cooldownDuration: 0
};

exports.help = {
  name: "auth",
  category: "Flairwars",
  description: "Authenticates a Reddit account. This helps us verify that the Reddit username you provided really belongs to you.",
  usage: "auth or auth <Reddit username> when a (mini)mod wants to let in another person"
};