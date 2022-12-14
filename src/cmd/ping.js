const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("š Test my response time!"),
  async execute(interaction) {
    await interaction.reply("Ping!");

    interaction.fetchReply().then((reply) => {
      const pingEmbed = new EmbedBuilder()
        .setTitle("Pong! š")
        .setDescription(
          `ā **Time:** ${
            reply.createdTimestamp - interaction.createdTimestamp
          } ms\nā±ļø **WS:** ${interaction.client.ws.ping} ms`
        )
        .setFooter({
          text: "Made by Syfe",
          iconURL: interaction.client.user.avatarURL(),
        });

      interaction.editReply({ content: null, embeds: [pingEmbed] });
    });
  },
};
