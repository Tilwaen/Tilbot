module.exports = async (client, r, unbClient, userCooldowns, globalCooldowns, authReq, member) => {
    const user = await unbClient.getUserBalance(member.guild.id, member.user.id);
    if (user.cash === 0) return;

    // Find what colour role the user had
    var colourRole = member.roles.find(role => client.config.colours.indexOf(role.name) !== -1);
    colour = !colourRole ? "No colour" : colourRole.name;

    // Replace the placeholders in the welcome message with actual data
    const message = client.config.shards.shardLoggingMessage
          .replace("{{user}}", member.user.tag)
          .replace("{{colour}}", colour)
          .replace("{{balance}}", user.cash);

    member.guild.channels
                .find(c => c.name === client.config.shards.shardLoggingChannel)
                .send(message)
                .catch(console.error);
};
