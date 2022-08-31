const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const fs = require("node:fs");
const dotenv = require("dotenv");
dotenv.config();

const isDevelopment = process.env.NODE_ENV === "development";

const commands = [];
const commandFiles = fs
  .readdirSync("./src/cmd")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./cmd/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    if (isDevelopment) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENTID,
          process.env.GUILDID
        ),
        { body: commands }
      );
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENTID), {
        body: commands,
      });
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
