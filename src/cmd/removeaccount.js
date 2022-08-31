const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeaccount")
    .setDescription("Remove an account from the bot.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription(
          "Username of the account you'd like to remove from the bot."
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");

    await interaction.deferReply({ ephemeral: true });

    const [user, newCreated] = await interaction.client.account.findOrCreate({
      where: { discordid: interaction.user.id },
      defaults: {
        discordid: interaction.user.id,
        blooketAccounts: [],
      },
    });

    if (!user.blooketAccounts.some((account) => account.username == username)) {
      const accountNotFound = new EmbedBuilder()
        .setTitle("Account not found.")
        .setDescription(`Could not find account with username ${username}.`)
        .setColor("#990000")
        .setFooter({
          text: `${interaction.client.botname} maintained by Syfe`,
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.editReply({
        content: null,
        embeds: [accountNotFound],
      });
    }

    await interaction.client.account.update(
      {
        blooketAccounts: user.blooketAccounts.filter(
          (account) => account.username != username
        ),
      },
      { where: { discordid: interaction.user.id } }
    );

    const accountRemoved = new EmbedBuilder()
      .setTitle("Account removed.")
      .setDescription(`Successfully removed account with username ${username}.`)
      .setColor("#ADFE77")
      .setFooter({
        text: `${interaction.client.botname} maintained by Syfe`,
        iconURL: interaction.client.user.avatarURL(),
      });

    await interaction.editReply({ content: null, embeds: [accountRemoved] });
  },
};
