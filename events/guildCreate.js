// This event executes when a new guild (server) is joined.

module.exports = (client, r, unbClient, userCooldowns, globalCooldowns, guild) => {
  client.logger.cmd(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot. Owner: ${guild.owner.user.tag} (${guild.owner.user.id})`);
};
