const Logger = require("../util/logger");

exports.CommandInteraction = async (client, interaction) => {
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    Logger.info(`Executing command: ${command.data.name}`);
    await command.execute(interaction);
  } catch (e) {
    Logger.error(`Error executing command: ${command.data.name}`);
    console.error(e);
  }
};
