const cron = require("node-cron");
const Logger = require("./logger");
const BlooketAccountHelper = require("./BlooketAccountHelper");

module.exports = function (client) {
  Logger.info("Scheduling auto-add cron job.");
  cron.schedule("0 0 * * *", () => {
    Logger.info("Auto-add cron job execution started.");
    client.account.findAll().then((users) => {
      users.forEach((user) => {
        Logger.debug(
          `Auto-add cron job: searching through ${user.discordid}'s accounts.`
        );
        if (user.blooketAccounts.length > 0) {
          user.blooketAccounts.forEach(async (baccount) => {
            Logger.debug(
              `Auto-add cron job: Checking account ${baccount.username} for ${user.discordid}'s account.`
            );
            if (baccount.autoadd) {
              Logger.debug(
                `Auto-add cron job: Executing auto-add on account ${baccount.username} for ${user.discordid}'s account.`
              );
              const blooketAccountInstance = new BlooketAccountHelper(
                baccount.email,
                baccount.password
              );
              await blooketAccountInstance.dailyTokens();
              Logger.debug(
                `Auto-add cron job: Finished auto-add on account ${baccount.username} for ${user.discordid}'s account.`
              );
            }
          });
        }
      });
    });
  });
};
