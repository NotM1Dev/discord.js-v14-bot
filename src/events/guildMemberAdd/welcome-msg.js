const { render } = require('render-templates');
const prisma = require('../../lib/prisma');

/** @param {import('discord.js').GuildMember} member */
module.exports = async (member) => {
    // if (member.user.bot || member.user.system) return;

    const entry = await prisma.welcomeMessage.findFirst({
        where: {
            guildId: member.guild.id
        }
    });

    if (!entry) return;

    try {
        /** @type {import('discord.js').TextChannel} */
        const channel = await member.client.channels.fetch(entry.channelId);
        if (!channel) return;

        const message = render(entry.message, {
            ping: member.toString(),
            server_name: member.guild.name,
            username: member.user.username,
            display_name: member.user.displayName,
            tag: member.user.tag
        });

        await channel.send(message);
    } catch (error) {
        console.error(error);
    }
};
