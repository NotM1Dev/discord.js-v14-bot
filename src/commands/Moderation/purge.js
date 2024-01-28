const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk-delete messages in a channel.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription('Amount of messages to delete.')
                .setMinValue(1)
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('from')
                .setDescription('Delete messages sent by a target.')
                .setRequired(false)
        )
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('Channel to delete messages in.')
                .setRequired(false)
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildVoice
                )
        ),

    /** @param {import('commandkit').SlashCommandProps} param0 */
    run: async ({ interaction }) => {
        const { options, member } = interaction;
        const target = options.getMember('from');

        /** @type {import('discord.js').TextBasedChannel} */
        const channel = options.getChannel('channel') || interaction.channel;

        let amount = options.getInteger('amount');
        if (amount >= 100) amount = 99;

        try {
            const messages = await channel.messages.fetch({
                limit: amount + 1
            });

            if (target) {
                const filteredMessages = [];
                let index = 0;

                /** @param {import('discord.js').Message<true>} message */
                const messageFilter = (message) => {
                    if (amount > index && message.author.id === target.user.id) {
                        filteredMessages.push(message);
                        index++;
                    }
                };

                messages.filter(messageFilter);

                const deletedMessages = await channel.bulkDelete(filteredMessages);
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Messages deleted successfully.')
                    .setAuthor({
                        name: member.user.username,
                        iconURL: member.displayAvatarURL({ size: 256 })
                    })
                    .setFields(
                        {
                            name: 'Target',
                            value: `${target.user.tag} \`${target.user.id}\``,
                            inline: true
                        },
                        {
                            name: 'Channel',
                            value: channel.toString(),
                            inline: true
                        },
                        {
                            name: 'Amount',
                            value: deletedMessages.size.toString(),
                            inline: true
                        }
                    );

                await interaction.reply({
                    embeds: [embed]
                });

                return;
            } else {
                const deletedMessages = await channel.bulkDelete(amount, true);
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Messages deleted successfully.')
                    .setAuthor({
                        name: member.user.username,
                        iconURL: member.displayAvatarURL({ size: 256 })
                    })
                    .setFields(
                        {
                            name: 'Channel',
                            value: channel.toString(),
                            inline: true
                        },
                        {
                            name: 'Amount',
                            value: deletedMessages.size.toString(),
                            inline: true
                        }
                    );

                await interaction.reply({
                    embeds: [embed]
                });

                return;
            }
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('There was an error deleting the messages.');

            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });

            return;
        }
    },

    /** @type {import('commandkit').CommandOptions} */
    options: {
        botPermissions: ['ManageMessages']
    }
};
