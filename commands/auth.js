exports.run = async (client, message, args, level, r, unbClient) => {
    const usernameBase64 = Buffer.from(message.author.tag).toString('base64');
    message.author.send(`Please authenticate your Reddit account through the link below:\n\nhttps://www.reddit.com/api/v1/authorize?client_id=${client.config.redditAuth.clientID}&response_type=code&state=${usernameBase64}&redirect_uri=${client.config.defaultSettings.oauthRedirectUri}&duration=temporary&scope=identity`);
    message.reply(", check your DMs!");
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