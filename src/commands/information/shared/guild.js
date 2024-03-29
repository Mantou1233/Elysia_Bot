const { EmbedBuilder, ChannelType, GuildVerificationLevel } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const moment = require("moment");

/**
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (guild) => {
  const { name, id, preferredLocale, channels, roles, ownerId } = guild;

  const owner = await guild.members.fetch(ownerId);
  const createdAt = moment(guild.createdAt);

  const totalChannels = channels.cache.size;
  const categories = channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
  const textChannels = channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const voiceChannels = channels.cache.filter(
    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice
  ).size;
  const threadChannels = channels.cache.filter(
    (c) => c.type === ChannelType.PrivateThread || c.type === ChannelType.PublicThread
  ).size;

  const memberCache = guild.members.cache;
  const all = memberCache.size;
  const bots = memberCache.filter((m) => m.user.bot).size;
  const users = all - bots;
  const onlineUsers = memberCache.filter((m) => !m.user.bot && m.presence?.status === "online").size;
  const onlineBots = memberCache.filter((m) => m.user.bot && m.presence?.status === "online").size;
  const onlineAll = onlineUsers + onlineBots;
  const rolesCount = roles.cache.size;

  const getMembersInRole = (members, role) => {
    return members.filter((m) => m.roles.cache.has(role.id)).size;
  };

  let rolesString = roles.cache
    .filter((r) => !r.name.includes("everyone"))
    .map((r) => `${r.name}[${getMembersInRole(memberCache, r)}]`)
    .join(", ");

  if (rolesString.length > 1024) rolesString = rolesString.substring(0, 1020) + "...";

  let { verificationLevel } = guild;
  switch (guild.verificationLevel) {
    case GuildVerificationLevel.VeryHigh:
      verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
      break;

    case GuildVerificationLevel.High:
      verificationLevel = "(╯°□°）╯︵ ┻�?┻";
      break;

    default:
      break;
  }

  let desc = "";
  desc = `${desc + "├"} **群組代號：** ${id}\n`;
  desc = `${desc + "├"} **群組名稱：** ${name}\n`;
  desc = `${desc + "├"} **群所有者：** ${owner.user.tag}\n`;
  desc = `${desc + "└"} **群組語言：** ${preferredLocale}\n`;
  desc += "\n";

  const embed = new EmbedBuilder()
    .setTitle("群駔資訊")
    .setTimestamp()
    .setFooter({ text: '來自花瓶星球的科技支援 v3.0', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg' })
    .setAuthor({ name: '你就是個偷窺狂吧！', iconURL: 'https://cdn.discordapp.com/attachments/1067805752183488663/1068501885193039973/1015210055_61696d776b439.jpg', url: 'https://github.com/RICE0707/Elysia_Bot' })
    .setThumbnail(guild.iconURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: `群組成員 [共${all}人]`,
        value: `\`\`\`使用者數：${users}\n機器人數：${bots}\`\`\``,
        inline: true,
      },
      {
        name: `在線統計 [共${onlineAll}人]`,
        value: `\`\`\`使用者數：${onlineUsers}\n機器人數：${onlineBots}\`\`\``,
        inline: true,
      },
      {
        name: `頻道類別 [共${totalChannels}個]`,
        value: `\`\`\`類別：${categories} | 文字：${textChannels} | 語音：${voiceChannels} | 討論串：${threadChannels}\`\`\``,
        inline: false,
      },
      {
        name: `群身份組 [共${rolesCount}個]`,
        value: `\`\`\`${rolesString}\`\`\``,
        inline: false,
      },
      {
        name: "驗證等級",
        value: `\`\`\`${verificationLevel}\`\`\``,
        inline: true,
      },
      {
        name: "加成數量",
        value: `\`\`\`${guild.premiumSubscriptionCount}\`\`\``,
        inline: true,
      },
      {
        name: `群創建日[${createdAt.fromNow()}]`,
        value: `\`\`\`${createdAt.format("YYYY-MM-DD hh:mm:ss")}\`\`\``,
        inline: false,
      }
    );

  if (guild.splashURL()) embed.setImage(guild.splashURL({ extension: "png", size: 256 }));

  return { embeds: [embed] };
};
