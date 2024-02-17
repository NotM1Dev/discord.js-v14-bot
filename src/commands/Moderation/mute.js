const ms = require('ms');
const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member in the server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The target to mute.')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('duration')
                .setDescription('How long the target should be muted for.')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('Specify a reason for muting this member.')
                .setRequired(false)
        ),

    /** @param {import('commandkit').SlashCommandProps} param0 */
    run: async ({ interaction }) => {
        const { options, member } = interaction;

        const target = options.getMember('target');
        const duration = options.getString('duration');
        const formattedDuration = ms(duration);
        const maxDuration = ms('28 days');
        const reason = options.getString('reason') ?? 'No reason provided.';

        if (formattedDuration > maxDuration) {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('Duration must be 28 days or less.');

            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });

            return;
        }

        try {
            await target.timeout(formattedDuration, reason);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Target muted successfully.')
                .setAuthor({
                    name: member.user.tag,
                    iconURL: member.user.displayAvatarURL({ size: 256 })
                })
                .setFields(
                    {
                        name: 'Target',
                        value: `${target.user.tag} \`${target.user.id}\``,
                        inline: true
                    },
                    {
                        name: 'Duration',
                        value: duration.toString(),
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason,
                        inline: false
                    }
                );

            await interaction.reply({
                embeds: [embed]
            });
            return;
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('There was an error muting this member.');

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
