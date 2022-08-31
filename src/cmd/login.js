const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const BlooketAccountHelper = require("../util/BlooketAccountHelper");
const Logger = require("../util/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("login")
    .setDescription("Login with your Blooket account to the bot!")
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription(
          "Email of the account you'd like to connect to the bot."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("password")
        .setDescription(
          "Password of the account you'd like to connect to the bot."
        )
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("autoadd")
        .setDescription(
          "Should this account be enrolled into the auto-add feature?"
        )
    ),
  async execute(interaction) {
    const email = interaction.options.getString("email");
    const password = interaction.options.getString("password");
    const autoadd = interaction.options.getBoolean("autoadd") || false;

    await interaction.deferReply({ ephemeral: true });

    const account = new BlooketAccountHelper(email, password);

    if (!(await account.getLoginSuccess())) {
      const loginFailed = new EmbedBuilder()
        .setTitle("Login failed.")
        .setDescription(`Could not login to account.`)
        .addFields(
          { name: "Email", value: email, inline: true },
          { name: "Password", value: password, inline: true }
        )
        .setColor("#990000")
        .setFooter({
          text: `${interaction.client.botname} maintained by Syfe`,
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.editReply({
        content: null,
        embeds: [loginFailed],
      });
    }

    const accountSession = await account.getAccountInfo();

    const [user, newCreated] = await interaction.client.account.findOrCreate({
      where: { discordid: interaction.user.id },
      defaults: {
        discordid: interaction.user.id,
        blooketAccounts: [],
      },
    });

    if (!user.blooketAccounts.some((account) => account.email == email)) {
      Logger.debug(`Adding account ${email} to user ${interaction.user.id}`);
      user.blooketAccounts = [
        ...user.blooketAccounts,
        {
          id: accountSession._id,
          username: accountSession.name,
          email: email,
          password: password,
          autoadd,
        },
      ];
      await interaction.client.account.update(
        { blooketAccounts: user.blooketAccounts },
        { where: { discordid: interaction.user.id } }
      );
    } else {
      Logger.debug(`Updating account ${email} for user ${interaction.user.id}`);
      user.blooketAccounts.some(function (account) {
        if (account.id == accountSession._id) {
          account.email = email;
          account.password = password;
          account.username = accountSession.name;
          return true;
        }
      });

      await interaction.client.account.update(
        { blooketAccounts: user.blooketAccounts },
        { where: { discordid: interaction.user.id } }
      );
    }

    const loginSuccess = new EmbedBuilder()
      .setTitle("Login successful!")
      .setDescription(
        `Logged in as **${accountSession.name}** ||(${accountSession._id})||.\nYour account has been saved to the bot, you can now use commands with the bot!\n\n\n*Try using **/autoadd <username>** to automatically claim your daily tokens and experience!*`
      )
      .setColor("#ADFE77")
      .setFooter({
        text: `${interaction.client.botname} maintained by Syfe`,
        iconURL: interaction.client.user.avatarURL(),
      });

    await interaction.editReply({ content: null, embeds: [loginSuccess] });

    if (autoadd) {
      const enrollAutoAdd = new EmbedBuilder()
        .setTitle("Enrolled into auto-add!")
        .setDescription(
          `You're account **${accountSession.name}** has been enrolled into auto-add.\nYou will now automatically receive your daily tokens and experience!\n\n\n*To remove auto-add simply use **/autoadd <username>***`
        )
        .setColor("#ADFE77")
        .setFooter({
          text: `${interaction.client.botname} maintained by Syfe`,
          iconURL: interaction.client.user.avatarURL(),
        });

      await interaction.followUp({
        content: null,
        embeds: [enrollAutoAdd],
        ephemeral: true,
      });
    }
  },
};
