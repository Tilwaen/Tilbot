module.exports = async (client, r, unbClient, userCooldowns, globalCooldowns, authReq, error) => {
  client.logger.log(`An error event was sent by Discord.js: \n${JSON.stringify(error)}`, "error");
};
