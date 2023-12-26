const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The target to kick.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Specify a reason for kicking this member.')
        .setMinLength(1)
        .setMaxLength(512)
        .setRequired(false)
    ),

  /** @param {import('commandkit').SlashCommandProps} param0 */
  run: async ({ interaction }) => {
    const { options, member } = interaction;

    const target = options.getMember('target');
    const reason = options.getString('reason') ?? 'No reason provided.';

    try {
      await target.kick(reason);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Target kicked successfully.')
        .setFields(
          {
            name: 'Target',
            value: `${target.user.tag} \`${target.user.id}\``,
            inline: true
          },
          {
            name: 'Moderator',
            value: `${member.user.tag} \`${member.user.id}\``,
            inline: true
          },
          {
            name: 'Reason',
            value: reason,
            inline: false
          }
        );

      await interaction.reply({ embeds: [embed] });
      return;
    } catch {
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('There was an error kicking this member.');

      await interaction.reply({
        embeds: [errorEmbed]
      });
      return;
    }
  },

  /** @type {import('commandkit').CommandOptions} */
  options: {
    botPermissions: ['KickMembers']
  }
};
