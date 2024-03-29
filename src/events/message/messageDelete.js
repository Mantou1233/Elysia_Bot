const { EmbedBuilder } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} message
 */
module.exports = async (client, message) => {
  if (message.partial) return;
  if (message.author.bot || !message.guild) return;

  const settings = await getSettings(message.guild);
  if (!settings.automod.anti_ghostping || !settings.modlog_channel) return;
  const { members, roles, everyone } = message.mentions;

  // Check message if it contains mentions
  if (members.size > 0 || roles.size > 0 || everyone) {
    const logChannel = message.guild.channels.cache.get(settings.modlog_channel);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setAuthor({ name: "花瓶偵測到有屁孩在亂標囉！", iconURL: 'https://cdn.discordapp.com/attachments/1067011834642698280/1068834656948068445/3.png', url: 'https://www.brilliantw.net/' })
      .setDescription(
        `**訊息：**\n${message.content}\n\n` +
          `**屁孩：** ${message.author.tag} \`${message.author.id}\`\n` +
          `**頻道：** ${message.channel.toString()}`
      )
      .addFields(
        {
          name: "成員",
          value: members.size.toString(),
          inline: true,
        },
        {
          name: "身份組",
          value: roles.size.toString(),
          inline: true,
        },
        {
          name: "Everyone？",
          value: everyone ? "是" : "否",
          inline: true,
        }
      )
      .setFooter({ text: `來自花瓶星球的科技支援 v3.0 - 發送至：${message.createdAt}` });

    logChannel.safeSend({ embeds: [embed] });
  }
};
