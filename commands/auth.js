exports.run = async (client, message, args, level, r, unbClient) => {
    if (!message.member.roles.find(role => role.name === client.config.defaultSettings.noRole)) {
        message.reply("you already have your colour role assigned!");
        return;
    }

    const usernameBase64 = Buffer.from(message.author.id).toString('base64');
    message.author.send(`Please authenticate your Reddit account through the link below. **We do not gain any sensitive data about your account**, all we do is verify that you're not claiming to be someone else.\n\nhttps://www.reddit.com/api/v1/authorize?client_id=${client.config.redditAuth.clientID}&response_type=code&state=${usernameBase64}&redirect_uri=${client.config.oauth.redirectUri}&duration=temporary&scope=identity`);
    message.reply("check your DMs!");
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["authenticate"],
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
  usage: "auth <Reddit username>"
};