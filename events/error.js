module.exports = async (client, r, userCooldowns, globalCooldowns, error) => {
  client.logger.log(`An error event was sent by Discord.js: \n${JSON.stringify(error)}`, "error");
};
