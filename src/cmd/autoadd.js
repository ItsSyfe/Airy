const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoadd")
    .setDescription("Toggle auto-add for an account.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription(
          "Username of the account you'd like to toggle auto-add for."
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

    const account =
      user.blooketAccounts[
        user.blooketAccounts.map((acc) => acc.username).indexOf(username)
      ];
    account.autoadd = !account.autoadd;

    await interaction.client.account.update(
      { blooketAccounts: user.blooketAccounts },
      { where: { discordid: interaction.user.id } }
    );

    const autoAddEmbed = new EmbedBuilder()
      .setTitle(`Auto-add ${account.autoadd ? "enrolled! ✅" : "delisted. ❌"}`)
      .setDescription(
        `Toggled auto-add for account **${username}**.${
          account.autoadd
            ? "\nYou will now automatically receive your daily tokens and experience!"
            : "\nIf you'd like to re-enroll back into auto-add use **/autoadd <username>**"
        }`
      )
      .setColor("#ADFE77")
      .setFooter({
        text: `${interaction.client.botname} maintained by Syfe`,
        iconURL: interaction.client.user.avatarURL(),
      });

    await interaction.editReply({ content: null, embeds: [autoAddEmbed] });
  },
};
