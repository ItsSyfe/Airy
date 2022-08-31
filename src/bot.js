const { Client, Collection, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const fs = require("node:fs");
const Logger = require("./util/logger");
const dotenv = require("dotenv");
dotenv.config();

client.botname = process.env.BOTNAME;

// --------------------------------
// Database initialization
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./data/database.sqlite",
});

sequelize
  .authenticate()
  .then(() => {
    Logger.info("Initialized database successfully.");
  })
  .catch((err) => {
    Logger.error("Error initializing database.");
    Logger.debug(err);
  });

client.account = sequelize.define("account", {
  discordid: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  blooketAccounts: DataTypes.JSON,
});

// --------------------------------
// Setup auto-add cron job
require("./util/CronJobHelper")(client);

// --------------------------------
// Load commands
client.commands = new Collection();
const cmdFiles = fs
  .readdirSync("./src/cmd/")
  .filter((file) => file.endsWith(".js"));

for (const file of cmdFiles) {
  const cmd = require(`./cmd/${file}`);
  Logger.info(`Loading command: ${cmd.data.name}`);
  client.commands.set(cmd.data.name, cmd);
  Logger.info(`Loaded command: ${cmd.data.name}`);
}

// --------------------------------
// Load events
const eventFiles = fs
  .readdirSync("./src/event/")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./event/${file}`);
  Logger.info(`Loading event: ${event.name}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
    Logger.info(`Loaded event: ${event.name}`);
  } else {
    client.on(event.name, (...args) => event.execute(client, ...args));
    Logger.info(`Loaded event: ${event.name}`);
  }
}

// --------------------------------

client.login(process.env.TOKEN);
