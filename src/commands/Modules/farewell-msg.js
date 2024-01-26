const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');

const prisma = require('../../lib/prisma');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('farewell-msg')
        .setDescription('Manage farewell messages in this server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) =>
            sub
                .setName('set')
                .setDescription('Configure a farewell message in a channel.')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('The channel to send messages in.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addStringOption((option) =>
                    option
                        .setName('message')
                        .setDescription(
                            'Message to send. Placeholders: {{ping}}, {{server_name}}, {{username}}, {{display_name}}, {{tag}}'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName('disable')
                .setDescription('Disable farewell messages from sending.')
        ),

    /** @param {import('commandkit').SlashCommandProps} param0 */
    run: async ({ interaction }) => {
        await interaction.deferReply();

        const { options, guild } = interaction;
        const subcommand = options.getSubcommand();

        const entry = await prisma.farewellMessage.findFirst({
            where: {
                guildId: guild.id
            }
        });

        switch (subcommand) {
            case 'set':
                const channel = options.getChannel('channel');
                const message = options.getString('message');

                if (entry) {
                    await prisma.farewellMessage.update({
                        where: {
                            guildId: guild.id
                        },
                        data: {
                            channelId: channel.id,
                            message
                        }
                    });
                } else {
                    await prisma.farewellMessage.create({
                        data: {
                            guildId: guild.id,
                            channelId: channel.id,
                            message
                        }
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription('Configuration updated successfully!')
                    .setFields(
                        {
                            name: 'Channel',
                            value: `<#${channel.id}>`,
                            inline: true
                        },
                        {
                            name: 'Message',
                            value: message.toString(),
                            inline: false
                        }
                    )
                    .setFooter({
                        text: guild.name,
                        iconURL: guild.iconURL({ size: 128 })
                    });

                await interaction.editReply({ embeds: [embed] });
                break;
            case 'disable':
                if (!entry) {
                    const doesntExistEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            'No farewell configuration exists for this server.'
                        )
                        .setFooter({
                            text: guild.name,
                            iconURL: guild.iconURL()
                        });

                    await interaction.editReply({ embeds: [doesntExistEmbed] });
                    return;
                }

                await prisma.farewellMessage.delete({
                    where: {
                        guildId: guild.id
                    }
                });

                const deletedEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription('Configuration deleted successfully.');

                await interaction.editReply({ embeds: [deletedEmbed] });
                break;
        }
    }
};
