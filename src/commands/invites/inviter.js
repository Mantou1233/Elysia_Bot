const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { stripIndent } = require("common-tags");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "邀請統計",
  description: "顯示邀請統計",
  category: "INVITE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[使用者|使用者代號]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "使用者",
        description: "輸入使用者",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInviter(message, target.user, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("使用者") || interaction.user;
    const response = await getInviter(interaction, user, data.settings);
    await interaction.followUp(response);
  },
};

async function getInviter({ guild }, user, settings) {
  if (!settings.invite.tracking) return `> <a:r2_rice:868583626227478591> 這個群組沒有開啟邀請統計。`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;
  if (!inviteData || !inviteData.inviter) return `> <a:r2_rice:868583626227478591> 花瓶不知道\` ${user.tag} \`是誰邀請的。`;

  const inviter = await guild.client.users.fetch(inviteData.inviter, false, true);
  const inviterData = (await getMember(guild.id, inviteData.inviter)).invite_data;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setAuthor({ name: `${user.username} 的邀請統計`, iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setDescription(
      stripIndent`
      ├ 邀請者：\` ${inviter?.tag || "已刪除使用者"} \`
      ├ 邀請者代碼：\` ${inviteData.inviter} \`
      ├ 使用的邀請連結：\` ${inviteData.code} \`
      └ 邀請連結使用次數：\` ${getEffectiveInvites(inviterData)} \`
      `
    );

  return { embeds: [embed] };
}
