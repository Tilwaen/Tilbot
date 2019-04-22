module.exports = async (client, r, unbClient, userCooldowns, globalCooldowns, error) => {
  client.logger.log(`An error event was sent by Discord.js: \n${JSON.stringify(error)}`, "error");
};
