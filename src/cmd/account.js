const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("account")
    .setDescription("View your Blooket accounts that are registed to the bot!"),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const [user, newCreated] = await interaction.client.account.findOrCreate({
      where: { discordid: interaction.user.id },
      defaults: {
        discordid: interaction.user.id,
        blooketAccounts: [],
      },
    });

    if (user.blooketAccounts.length == 0) {
      const noLinkedAccountsEmbed = new EmbedBuilder()
        .setTitle("Link an account.")
        .setDescription(
          `If you'd like to link an account to the bot, use \`\`/login <email> <password>\`\``
        )
        .setColor("#ADFE77")
        .setFooter({
          text: `${interaction.client.botname} maintained by Syfe`,
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.editReply({
        content: null,
        embeds: [noLinkedAccountsEmbed],
      });
    }

    const accountEmbeds = [];
    let pageNumber = 0;

    for (let i = 0; i < Math.ceil(user.blooketAccounts.length / 5); i++) {
      const accounts = user.blooketAccounts.slice(i * 5, i * 5 + 5);
      const accountEmbed = new EmbedBuilder()
        .setTitle(`Accounts page ${i + 1}`)
        .setColor("#ADFE77")
        .setFooter({
          text: `${interaction.client.botname} maintained by Syfe`,
          iconURL: interaction.client.user.avatarURL(),
        });

      for (let j = 0; j < accounts.length; j++) {
        accountEmbed.addFields({
          name: `${i * 5 + j + 1} | ${accounts[j].username}`,
          value: `**Email:** ||${accounts[j].email}||\n**Auto-add:** ${
            accounts[j].autoadd ? "✅" : "❌"
          }\n**ID:** ${accounts[j].id}`,
        });
      }

      accountEmbeds.push(accountEmbed);
    }

    const pageNav = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("left")
        .setLabel("◀️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("right")
        .setLabel("▶️")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      content: null,
      embeds: [accountEmbeds[pageNumber]],
      components: [pageNav],
    });

    const filter = (i) => i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", async (button) => {
      if (!(button.customId === "left" || button.customId === "right")) return;

      if (button.customId === "left") {
        if (pageNumber == 0) pageNumber = accountEmbeds.length - 1;
        else pageNumber--;
      }

      if (button.customId === "right") {
        if (pageNumber == accountEmbeds.length - 1) pageNumber = 0;
        else pageNumber++;
      }

      button.update({
        content: null,
        embeds: [accountEmbeds[pageNumber]],
        components: [pageNav],
      });
    });
  },
};
