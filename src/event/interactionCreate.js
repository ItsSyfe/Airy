const {
  CommandInteraction,
  ButtonInteraction,
  ModalInteraction,
} = require("../util/InteractionEventHelper");
const Logger = require("../util/logger");

module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    Logger.debug(
      `Interaction created: ${interaction.id} - ${interaction.type}`
    );

    if (interaction.isCommand()) await CommandInteraction(client, interaction);
  },
};
