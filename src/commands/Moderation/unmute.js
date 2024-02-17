const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member in the server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The target to unmute.')
                .setRequired(true)
        ),

    /** @param {import('commandkit').SlashCommandProps} param0 */
    run: async ({ interaction }) => {
        const { options, member } = interaction;
        const target = options.getMember('target');

        try {
            await target.timeout(null);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Target unmuted successfully.')
                .setAuthor({
                    name: member.user.tag,
                    iconURL: member.user.displayAvatarURL({ size: 256 })
                })
                .setFields({
                    name: 'Target',
                    value: `${target.user.tag} \`${target.user.id}\``,
                    inline: true
                });

            await interaction.reply({ embeds: [embed] });
            return;
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('There was an error unmuting this member.');

            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
            return;
        }
    },

    /** @type {import('commandkit').CommandOptions} */
    options: {
        botPermissions: ['ModerateMembers']
    }
};
