const Logger = require("../util/logger");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    client.account.sync();
    Logger.info(`Ready! Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: "your Blooket account.", type: "WATCHING" }],
    });
  },
};
