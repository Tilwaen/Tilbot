// This event executes when a new member joins a server. Let's welcome them!

module.exports = async (client, r, unbClient, userCooldowns, globalCooldowns, authReq, member) => {
  // Load the guild's settings
  const settings = client.getSettings(member.guild.id);

  const user = await unbClient.getUserBalance(member.guild.id, member.user.id);
  if (user.cash === 0) return;

  const colours = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];
  var colourRole = member.roles.find(role => colours.indexOf(role.name) !== -1);
  colour = !colourRole ? "No colour" : colourRole.name;

  // Replace the placeholders in the welcome message with actual data
  const message = settings.shardLoggingMessage
          .replace("{{user}}", member.user.tag)
          .replace("{{colour}}", colour)
          .replace("{{balance}}", user.cash);

  member.guild.channels.find(c => c.name === settings.shardLoggingChannel).send(message).catch(console.error);
};
