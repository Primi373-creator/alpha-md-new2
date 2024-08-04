const {
  Alpha,
  isAdmin,
  isBotAdmin,
  lang,
  config,
  groupDB,
  PREFIX,
  sleep,
} = require("../lib");
const { common } = require("../lib/common");
const actions = ["kick", "warn", "null"];

Alpha(
  {
    pattern: "promote ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.PROMOTE.DESC,
  },
  async (message, match) => {
    let admin = await isAdmin(message);
    let BotAdmin = await isBotAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;

    if (match.toLowerCase() == "all") {
      const groupMetadata = await message.client
        .groupMetadata(message.jid)
        .catch((e) => {});
      const participants = await groupMetadata.participants;
      const nonAdmins = participants
        .filter((U) => !U.admin)
        .map(({ id }) => id);
      let success = true;
      for (let participant of nonAdmins) {
        await sleep(250); // to prevent rate limiting
        try {
          await message.client.groupParticipantsUpdate(
            message.jid,
            [participant],
            "promote",
          );
        } catch (e) {
          success = false;
        }
      }
      if (success) {
        return await message.reply("All participants have been promoted!");
      } else {
        return await message.reply("Failed to promote some participants.");
      }
    } else {
      if (!message.reply_message.sender)
        return message.reply(lang.BASE.NEED.format("user"));
      try {
        await message.client.groupParticipantsUpdate(
          message.jid,
          [message.reply_message.sender],
          "promote",
        );
        return message.send(
          lang.GROUP.PROMOTE.INFO.format(
            `@${message.reply_message.sender.split("@")[0]}`,
          ),
          {
            mentions: [message.reply_message.sender],
          },
        );
      } catch (e) {
        return message.reply("Failed to promote the participant.");
      }
    }
  },
);

Alpha(
  {
    pattern: "demote ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.DEMOTE.DESC,
  },
  async (message, match) => {
    let admin = await isAdmin(message);
    let BotAdmin = await isBotAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    const groupMetadata = await message.client
      .groupMetadata(message.jid)
      .catch((e) => {});
    const participants = await groupMetadata.participants;
    // Check if the bot user is among participants
    const botUserId = conn.user.id;
    const isBotUserAdmin = participants.some(
      (participant) => participant.id === botUserId && participant.admin,
    );
    if (match.toLowerCase() == "all") {
      const admins = participants
        .filter((U) => U.admin && U.id !== botUserId)
        .map(({ id }) => id);
      let success = true;
      for (let participant of admins) {
        await sleep(250); // to prevent rate limiting
        try {
          await message.client.groupParticipantsUpdate(
            message.jid,
            [participant],
            "demote",
          );
        } catch (e) {
          success = false;
        }
      }
      if (success) {
        return await message.reply(
          "All admins (except the bot user) have been demoted!",
        );
      } else {
        return await message.reply("Failed to demote some admins.");
      }
    } else {
      if (!message.reply_message.sender)
        return message.reply(lang.BASE.NEED.format("user"));
      const targetUserId = message.reply_message.sender;
      // Skip demotion if the target user is the bot user
      if (targetUserId === botUserId) {
        return await message.reply("Cannot demote the bot user.");
      }
      try {
        await message.client.groupParticipantsUpdate(
          message.jid,
          [targetUserId],
          "demote",
        );
        return message.send(
          lang.GROUP.DEMOTE.INFO.format(`@${targetUserId.split("@")[0]}`),
          {
            mentions: [targetUserId],
          },
        );
      } catch (e) {
        return message.reply("Failed to demote the participant.");
      }
    }
  },
);

Alpha(
  {
    pattern: "kick ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.KICK.DESC,
  },
  async (message, match) => {
    let admin = await isAdmin(message);
    let BotAdmin = await isBotAdmin(message);
    let user = message.reply_message.sender || match;
    if (!user) return await message.send(lang.GROUP.KICK.HELP);
    user = user.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    if (match != "all") {
      if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
      if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
      if (!admin && !message.isCreator) return;
      await message.client.groupParticipantsUpdate(
        message.jid,
        [user],
        "remove",
      );
      return await message.send(
        lang.GROUP.KICK.INFO.format(`@${user.split("@")[0]}`),
        {
          mentions: [user],
        },
      );
    } else if (match.toLowerCase() == "all") {
      if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
      if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
      if (!admin && !message.isCreator) return;
      const groupMetadata = await message.client
        .groupMetadata(message.jid)
        .catch((e) => {});
      const participants = await groupMetadata.participants;
      let admins = await participants
        .filter((v) => v.admin !== null)
        .map((v) => v.id);
      participants
        .filter((U) => !U.admin == true)
        .map(({ id }) => id)
        .forEach(async (k) => {
          await sleep(250);
          await message.client.groupParticipantsUpdate(
            message.jid,
            [k],
            "remove",
          );
        });
      return await message.reply("all group Participants has been kicked!");
    }
  },
);

Alpha(
  {
    pattern: "add ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.ADD.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    match = message.reply_message.sender || match;
    if (!match) return await message.reply(lang.BASE.NEED.format("user"));
    match = match.replaceAll(" ", "");
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    if (match) {
      let users = match.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      let info = await message.client.onWhatsApp(users);
      ex = info.map((jid) => jid.jid);
      if (!ex.includes(users))
        return await message.reply(lang.GROUP.ADD.NOT_FOUND);
      const su = await message.client.groupParticipantsUpdate(
        message.jid,
        [users],
        "add",
      );
      if (su[0].status == 403) {
        message.reply(lang.GROUP.ADD.INVITE);
        return await message.sendGroupInviteMessage(users);
      } else if (su[0].status == 408) {
        await message.send(
          lang.GROUP.ADD.LEFTED.format("@" + users.split("@")[0]),
          {
            mentions: [users],
          },
        );
        const code = await message.client.groupInviteCode(message.jid);
        return await message.client.sendMessage(users, {
          text: `https://chat.whatsapp.com/${code}`,
        });
      } else if (su[0].status == 401) {
        await message.send(
          lang.GROUP.ADD.BLOCKED.format("@" + users.split("@")[0]),
          {
            mentions: [users],
          },
        );
      } else if (su[0].status == 200) {
        return await message.send(
          lang.GROUP.ADD.ADDED.format("@" + users.split("@")[0]),
          {
            mentions: [users],
          },
        );
      } else if (su[0].status == 409) {
        return await message.send(
          lang.GROUP.ADD.ALLREADY.format("@" + users.split("@")[0]),
          {
            mentions: [users],
          },
        );
      } else {
        return await message.reply(JSON.stringify(su));
      }
    }
  },
);

Alpha(
  {
    pattern: "gpp ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.GPP.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    if (!message.reply_message.image)
      return await message.reply(lang.BASE.NEED.format("image message"));
    let _message = message.reply_message.imageMessage;
    let download = await message.client.downloadMediaMessage(_message);
    await message.client.updateProfilePicture(message.jid, download);
    return message.reply(lang.GROUP.GPP.INFO);
  },
);

Alpha(
  {
    pattern: "fullgpp ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.FULL_GPP.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    if (!message.reply_message.image)
      return await message.reply(lang.BASE.NEED.format("image message"));
    let download = await message.reply_message.download();
    await message.updateProfilePicture(message.jid, download);
    return message.reply(lang.GROUP.FULL_GPP.INFO);
  },
);

Alpha(
  {
    pattern: "gname ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.G_NAME.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    if (message.text > 75)
      return await message.send(lang.GROUP.G_NAME.LENGTH_OVER);
    let txt = message.text || " ";
    await message.client.groupUpdateSubject(message.jid, txt);
    return await message.send(lang.GROUP.G_NAME.SUCCESS);
  },
);

Alpha(
  {
    pattern: "gdesc ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.G_DESC.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    if (message.text > 400)
      return await message.send(lang.GROUP.G_DESC.LENGTH_OVER);
    let txt = match || " ";
    await message.client.groupUpdateDescription(message.jid, txt);
    return await message.send(lang.GROUP.G_DESC.SUCCESS);
  },
);

Alpha(
  {
    pattern: "mute ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.MUTE.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    await message.client.groupSettingUpdate(message.jid, "announcement");
    return await message.send(lang.GROUP.MUTE.SUCCESS);
  },
);

Alpha(
  {
    pattern: "unmute ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.UNMUTE.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    await message.client.groupSettingUpdate(message.jid, "not_announcement");
    return await message.send(lang.GROUP.UNMUTE.SUCCESS);
  },
);

Alpha(
  {
    pattern: "lock ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.LOCK.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    await message.client.groupSettingUpdate(message.jid, "locked");
    return await message.send(lang.GROUP.LOCK.SUCCESS);
  },
);

Alpha(
  {
    pattern: "unlock ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.UNLOCK.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    await message.client.groupSettingUpdate(message.jid, "unlocked");
    return await message.send(lang.GROUP.UNLOCK.SUCCESS);
  },
);

Alpha(
  {
    pattern: "leave ?(.*)",
    type: "group",
    onlyGroup: true,
    desc: lang.GROUP.LEFT.DESC,
    fromMe: true,
  },
  async (message, match) => {
    await message.client.groupLeave(message.jid);
  },
);

Alpha(
  {
    pattern: "join ?(.*)",
    type: "group",
    fromMe: true,
    desc: lang.GROUP.ACPT.DESC,
  },
  async (message, match) => {
    if (!match || !match.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/))
      return await message.reply(lang.GROUP.ACPT.NOT_VALID);
    let urlArray = match.trim().split("/");
    if (!urlArray[2] == "chat.whatsapp.com")
      return await message.send(lang.BASE.INVALID_URL);
    const response = await message.client.groupAcceptInvite(urlArray[3]);
    return await message.send(lang.BASE.SUCCESS);
  },
);

Alpha(
  {
    pattern: "invite ?(.*)",
    type: "group",
    onlyGroup: true,
    fromMe: true,
    desc: lang.GROUP.INVITE.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    const code = await message.client.groupInviteCode(message.jid);
    return await message.send(
      lang.GROUP.INVITE.INFO.format(`https://chat.whatsapp.com/${code}`),
    );
  },
);

Alpha(
  {
    pattern: "revoke ?(.*)",
    type: "group",
    fromMe: true,
    onlyGroup: true,
    desc: lang.GROUP.REVOKE.DESC,
  },
  async (message, match) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    await message.client.groupRevokeInvite(message.jid);
    return await message.send(lang.GROUP.REVOKE.INFO);
  },
);

Alpha(
  {
    pattern: "getinfo ?(.*)",
    type: "group",
    fromMe: true,
    desc: lang.GROUP.GET_INFO.DESC,
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    if (!match || !match.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/))
      return await message.reply(lang.GROUP.GET_INFO.GIVE_URL);
    let urlArray = match.trim().split("/")[3];
    const response = await message.client.groupGetInviteInfo(urlArray);
    return await message.send(
      "id: " +
        response.id +
        lang.GROUP.GET_INFO.INFO.format(
          response.subject,
          response.owner ? response.owner.split("@")[0] : "unknown",
          response.size,
          response.restrict,
          response.announce,
          require("moment-timezone")(response.creation * 1000)
            .tz("Asia/Kolkata")
            .format("DD/MM/YYYY HH:mm:ss"),
          response.desc,
        ),
    );
  },
);

Alpha(
  {
    pattern: "antidemote ?(.*)",
    desc: "demote actor and re-promote demoted person",
    type: "group",
    onlyGroup: true,
    fromMe: true,
  },
  async (message, match) => {
    if (!match) return message.reply("antidemote on/off");
    if (match != "on" && match != "off")
      return message.reply(
        "antidemote on\n\n*note antidemote only works if pdm is on*",
      );
    const { antidemote } = await groupDB(
      ["antidemote"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match == "on") {
      if (antidemote == "true") return message.reply("_Already activated_");
      await groupDB(
        ["antidemote"],
        { jid: message.jid, content: "true" },
        "set",
      );
      return await message.reply("_activated_");
    } else if (match == "off") {
      if (antidemote == "false") return message.reply("_Already Deactivated_");
      await groupDB(
        ["antidemote"],
        { jid: message.jid, content: "false" },
        "set",
      );
      return await message.reply("_deactivated_");
    }
  },
);

Alpha(
  {
    pattern: "antipromote ?(.*)",
    desc: "demote actor and re-promote demoted person",
    type: "group",
    onlyGroup: true,
    fromMe: true,
  },
  async (message, match) => {
    if (!match) return message.reply("antipromote on/off");
    if (match != "on" && match != "off")
      return message.reply(
        "antipromote on\n\n*note antipromote only works if pdm is on*",
      );
    const { antipromote } = await groupDB(
      ["antipromote"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match == "on") {
      if (antipromote == "true") return message.reply("_Already activated_");
      await groupDB(
        ["antipromote"],
        { jid: message.jid, content: "true" },
        "set",
      );
      return await message.reply("_activated_");
    } else if (match == "off") {
      if (antipromote == "false") return message.reply("_Already Deactivated_");
      await groupDB(
        ["antipromote"],
        { jid: message.jid, content: "false" },
        "set",
      );
      return await message.reply("_deactivated_");
    }
  },
);

Alpha(
  {
    pattern: "antibot ?(.*)",
    desc: "remove users who use bot",
    type: "group",
    onlyGroup: true,
    fromMe: true,
  },
  async (message, match) => {
    if (!match)
      return await message.reply(
        "_*antibot* on/off_\n_*antibot* action warn/kick/null_",
      );
    const { antibot } = await groupDB(
      ["antibot"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match.toLowerCase() == "on") {
      const action = antibot && antibot.action ? antibot.action : "null";
      await groupDB(
        ["antibot"],
        { jid: message.jid, content: { status: "true", action } },
        "set",
      );
      return await message.send(
        `_antibot Activated with action null_\n_*antibot action* warn/kick/null for chaning actions_`,
      );
    } else if (match.toLowerCase() == "off") {
      const action = antibot && antibot.action ? antibot.action : "null";
      await groupDB(
        ["antibot"],
        { jid: message.jid, content: { status: "false", action } },
        "set",
      );
      return await message.send(`_antibot deactivated_`);
    } else if (match.toLowerCase().match("action")) {
      const status = antibot && antibot.status ? antibot.status : "false";
      match = match.replace(/action/gi, "").trim();
      if (!actions.includes(match))
        return await message.send("_action must be warn,kick or null_");
      await groupDB(
        ["antibot"],
        { jid: message.jid, content: { status, action: match } },
        "set",
      );
      return await message.send(`_AntiBot Action Updated_`);
    }
  },
);

Alpha(
  {
    pattern: "antifake ?(.*)",
    desc: "remove fake numbers",
    fromMe: true,
    react: "🖕",
    type: "group",
    onlyGroup: true,
  },
  async (message, match) => {
    if (!match)
      return await message.reply(
        "_*antifake* 94,92_\n_*antifake* on/off_\n_*antifake* list_",
      );
    const { antifake } = await groupDB(
      ["antifake"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match.toLowerCase() == "get") {
      if (!antifake || antifake.status == "false" || !antifake.data)
        return await message.send("_Not Found_");
      return await message.send(
        `_*activated restricted numbers*: ${antifake.data}_`,
      );
    } else if (match.toLowerCase() == "on") {
      const data = antifake && antifake.data ? antifake.data : "";
      await groupDB(
        ["antifake"],
        { jid: message.jid, content: { status: "true", data } },
        "set",
      );
      return await message.send(`_Antifake Activated_`);
    } else if (match.toLowerCase() == "off") {
      const data = antifake && antifake.data ? antifake.data : "";
      await groupDB(
        ["antifake"],
        { jid: message.jid, content: { status: "false", data } },
        "set",
      );
      return await message.send(`_Antifake Deactivated_`);
    }
    match = match.replace(/[^0-9,!]/g, "");
    if (!match) return await message.send("value must be number");
    const status = antifake && antifake.status ? antifake.status : "false";
    await groupDB(
      ["antifake"],
      { jid: message.jid, content: { status, data: match } },
      "set",
    );
    return await message.send(`_Antifake Updated_`);
  },
);

Alpha(
  {
    pattern: "antilink ?(.*)",
    desc: "remove users who send links",
    type: "group",
    onlyGroup: true,
    fromMe: true,
  },
  async (message, match) => {
    if (!match)
      return await message.reply(
        "_*antilink* on/off_\n_*antilink* action warn/kick/null_",
      );
    const { antilink } = await groupDB(
      ["antilink"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match.toLowerCase() == "on") {
      const action = antilink && antilink.action ? antilink.action : "null";
      await groupDB(
        ["antilink"],
        { jid: message.jid, content: { status: "true", action } },
        "set",
      );
      return await message.send(
        `_antilink Activated with action null_\n_*antilink action* warn/kick/null for chaning actions_`,
      );
    } else if (match.toLowerCase() == "off") {
      const action = antilink && antilink.action ? antilink.action : "null";
      await groupDB(
        ["antilink"],
        { jid: message.jid, content: { status: "false", action } },
        "set",
      );
      return await message.send(`_antilink deactivated_`);
    } else if (match.toLowerCase().match("action")) {
      const status = antilink && antilink.status ? antilink.status : "false";
      match = match.replace(/action/gi, "").trim();
      if (!actions.includes(match))
        return await message.send("_action must be warn,kick or null_");
      await groupDB(
        ["antilink"],
        { jid: message.jid, content: { status, action: match } },
        "set",
      );
      return await message.send(`_AntiLink Action Updated_`);
    }
  },
);

Alpha(
  {
    pattern: "antiword ?(.*)",
    desc: "remove users who use restricted words",
    type: "group",
    onlyGroup: true,
    fromMe: true,
  },
  async (message, match) => {
    if (!match)
      return await message.reply(
        "_*antiword* on/off_\n_*antiword* action warn/kick/null_",
      );
    const { antiword } = await groupDB(
      ["antiword"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match.toLowerCase() == "get") {
      const status = antiword && antiword.status == "true" ? true : false;
      if (!status || !antiword.word) return await message.send("_Not Found_");
      return await message.send(`_*activated antiwords*: ${antiword.word}_`);
    } else if (match.toLowerCase() == "on") {
      const action = antiword && antiword.action ? antiword.action : "null";
      const word = antiword && antiword.word ? antiword.word : undefined;
      await groupDB(
        ["antiword"],
        { jid: message.jid, content: { status: "true", action, word } },
        "set",
      );
      return await message.send(
        `_antiword Activated with action null_\n_*antiword action* warn/kick/null for chaning actions_`,
      );
    } else if (match.toLowerCase() == "off") {
      const action = antiword && antiword.action ? antiword.action : "null";
      const word = antiword && antiword.word ? antiword.word : undefined;
      await groupDB(
        ["antiword"],
        { jid: message.jid, content: { status: "false", action, word } },
        "set",
      );
      return await message.send(`_antiword deactivated_`);
    } else if (match.toLowerCase().match("action")) {
      const status = antiword && antiword.status ? antiword.status : "false";
      match = match.replace(/action/gi, "").trim();
      if (!actions.includes(match))
        return await message.send("_action must be warn,kick or null_");
      await groupDB(
        ["antiword"],
        { jid: message.jid, content: { status, action: match } },
        "set",
      );
      return await message.send(`_antiword Action Updated_`);
    } else {
      if (!match)
        return await message.send("_*Example:* antiword 🏳️‍🌈, gay, nigga_");
      const status = antiword && antiword.status ? antiword.status : "false";
      const action = antiword && antiword.action ? antiword.action : "null";
      await groupDB(
        ["antiword"],
        { jid: message.jid, content: { status, action, word: match } },
        "set",
      );
      return await message.send(`_Antiwords Updated_`);
    }
  },
);

Alpha(
  {
    pattern: "pdm ?(.*)",
    desc: "promote, demote message",
    type: "group",
    onlyGroup: true,
    fromMe: true,
  },
  async (message, match) => {
    if (!match) return message.reply("pdm on/off");
    if (match != "on" && match != "off") return message.reply("pdm on");
    const { pdm } = await groupDB(
      ["pdm"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match == "on") {
      if (pdm == "true") return message.reply("_Already activated_");
      await groupDB(["pdm"], { jid: message.jid, content: "true" }, "set");
      return await message.reply("_activated_");
    } else if (match == "off") {
      if (pdm == "false") return message.reply("_Already Deactivated_");
      await groupDB(["pdm"], { jid: message.jid, content: "false" }, "set");
      return await message.reply("_deactivated_");
    }
  },
);

Alpha(
  {
    pattern: "warn ?(.*)",
    desc: lang.WARN.DESC,
    react: "😑",
    type: "group",
    fromMe: true,
    onlyGroup: true,
  },
  async (message, match) => {
    if (!match && !message.reply_message.sender)
      return await message.send(
        lang.WARN.METHODE.format("warn", "warn", "warn"),
      );
    if (match == "get") {
      const { warn } = await groupDB(
        ["warn"],
        { jid: message.jid, content: {} },
        "get",
      );
      if (!Object.keys(warn)[0]) return await message.send("_Not Found!_");
      let msg = "";
      for (const f in warn) {
        msg += `_*user:* @${f}_\n_*count:* ${warn[f].count}_\n_*remaining:* ${config.WARNCOUNT - warn[f].count}_\n\n`;
      }
      return await message.send(msg, {
        mentions: [message.reply_message.sender],
      });
    } else if (match == "reset") {
      if (!message.reply_message.sender)
        return await message.send(lang.BASE.NEED.format("user"));
      const { warn } = await groupDB(
        ["warn"],
        { jid: message.jid, content: {} },
        "get",
      );
      if (!Object.keys(warn)[0]) return await message.send("_Not Found!_");
      if (!Object.keys(warn).includes(message.reply_message.number))
        return await message.send("_User Not Found!_");
      await groupDB(
        ["warn"],
        { jid: message.jid, content: { id: message.reply_message.number } },
        "delete",
      );
      return await message.send(lang.BASE.SUCCESS);
    } else {
      const BotAdmin = await isBotAdmin(message);
      const admin = await isAdmin(message);
      if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
      if (config.ADMIN_SUDO_ACCESS != "true" && !message.isCreator)
        return await message.reply(lang.BASE.NOT_AUTHR);
      if (!admin && !message.isCreator)
        return await message.reply(lang.BASE.NOT_AUTHR);
      if (!message.reply_message.sender)
        return await message.send(lang.BASE.NEED.format("user"));
      const reason = match || "warning";
      const { warn } = await groupDB(
        ["warn"],
        { jid: message.jid, content: {} },
        "get",
      );
      const count = Object.keys(warn).includes(message.reply_message.number)
        ? Number(warn[message.reply_message.number].count) + 1
        : 1;
      await groupDB(
        ["warn"],
        {
          jid: message.jid,
          content: { [message.reply_message.number]: { count } },
        },
        "add",
      );
      const remains = config.WARNCOUNT - count;
      let warnmsg = `⚠️ *WARNING* ⚠️\n*User:* @${message.reply_message.number}\n------------------\nℹ️ INFO ℹ️\n*Reason:* ${reason}\n*Count:* ${count}\n*Remaining:* ${remains}`;
      await message.send(warnmsg, {
        mentions: [message.reply_message.sender],
      });
      if (remains <= 0) {
        await groupDB(
          ["warn"],
          { jid: message.jid, content: { id: message.reply_message.number } },
          "delete",
        );
        if (BotAdmin) {
          await message.client.groupParticipantsUpdate(
            message.from,
            [message.reply_message.sender],
            "remove",
          );
          return await message.reply(lang.WARN.MAX);
        }
      }
    }
  },
);

Alpha(
  {
    pattern: "vote ?(.*)",
    desc: "create a poll message",
    fromMe: true,
    type: "group",
    onlyGroup: true,
  },
  async (message, match) => {
    match = message.body.replace(/vote/gi, "").replace(PREFIX, "").trim();

    if (!match || !match.includes("|"))
      return await message.reply(
        `_*Example:* ${PREFIX}vote title|option1|option2|option3..._`,
      );

    const [title, ...options] = match.split("|").map((part) => part.trim());
    const { participants } = await message.client.groupMetadata(message.jid);

    return await message.send(
      {
        name: title.trim(),
        values: options.map((option, index) => ({
          name: option,
          id: `option_${index}`,
        })),
        withPrefix: false,
        onlyOnce: true,
        participates: participants.map((a) => a.id),
        selectableCount: true,
      },
      {},
      "poll",
    );
  },
);

Alpha(
  {
    pattern: "welcome ?(.*)",
    desc: "set welcome message",
    react: "😅",
    type: "group",
    fromMe: true,
    onlyGroup: true,
  },
  async (message, match) => {
    const { welcome } = await groupDB(["welcome"],{ jid: message.jid, content: {} },  "get",);
    if (match.toLowerCase() == "get") {
      const status = welcome && welcome.status ? welcome.status : "false";
      if (status == "false")
        return await message.send(
          `_*Example:* welcome get_\n_welcome hy &mention\n_*for more:* visit ${config.BASE_URL}info/welcome_`,
        );
      if (!welcome.message) return await message.send("*Not Found*");
      return await message.send(welcome.message);
    } else if (match.toLowerCase() == "off") {
      const status = welcome && welcome.status ? welcome.status : "false";
      if (status == "false") return await message.send(`_already deactivated_`);
      await groupDB(
        ["welcome"],
        {
          jid: message.jid,
          content: { status: "false", message: welcome.message },
        },
        "set",
      );
      return await message.send("*successfull*");
    } else if (match.toLowerCase() == "on") {
      const status = welcome && welcome.status ? welcome.status : "false";
      if (status == "true") return await message.send(`_already activated_`);
      await groupDB(
        ["welcome"],
        {
          jid: message.jid,
          content: { status: "true", message: welcome.message },
        },
        "set",
      );
      return await message.send("*successfull*");
    } else if (match) {
      const status = welcome && welcome.status ? welcome.status : "false";
      await groupDB(
        ["welcome"],
        { jid: message.jid, content: { status, message: match } },
        "set",
      );
      return await message.send("*success*");
    }
    return await message.send(
      "_*welcome get*_\n_*welcome* thank you for joining &mention_\n*_welcome false_*",
    );
  },
);

Alpha(
  {
    pattern: "goodbye ?(.*)",
    desc: "set goodbye message",
    react: "👏",
    type: "group",
    fromMe: true,
    onlyGroup: true,
  },
  async (message, match) => {
    const { exit } = await groupDB(
      ["exit"],
      { jid: message.jid, content: {} },
      "get",
    );
    if (match.toLowerCase() == "get") {
      const status = exit && exit.status ? exit.status : "false";
      if (status == "false")
        return await message.send(
          `_*Example:* goodbye get_\n_goodbye hy &mention\n_*for more:* visit ${config.BASE_URL}info/goodbye_`,
        );
      if (!exit.message) return await message.send("*Not Found*");
      return await message.send(goodbye.message);
    } else if (match.toLowerCase() == "off") {
      const status = exit && exit.status ? exit.status : "false";
      if (status == "false") return await message.send(`_already activated_`);
      await groupDB(
        ["exit"],
        {
          jid: message.jid,
          content: { status: "false", message: exit.message },
        },
        "set",
      );
      return await message.send("*successfull*");
    } else if (match.toLowerCase() == "on") {
      const status = exit && exit.status ? exit.status : "false";
      if (status == "true") return await message.send(`_already deactivated_`);
      await groupDB(
        ["exit"],
        {
          jid: message.jid,
          content: { status: "true", message: exit.message },
        },
        "set",
      );
      return await message.send("*successfull*");
    } else if (match) {
      const status = exit && exit.status ? exit.status : "false";
      await groupDB(
        ["exit"],
        { jid: message.jid, content: { status, message: match } },
        "set",
      );
      return await message.send("*success*");
    }
    return await message.send(
      "_*goodbye get*_\n_*goodbye* thank you for joining &mention_\n*_goodbye false_*",
    );
  },
);

const help = `To find common participants in multiple groups and perform actions, use the format: ${PREFIX}common <group1_jid>, <group2_jid>, ... ;<action>. Replace JIDs with groups to compare, separated by commas, then add a semicolon followed by the action. Actions include listing common participants (list/listall) or kicking them (kick/kickall). Example: ${PREFIX}common 120363266704865818@g.us, 120363303061636757@g.us;list.`;
Alpha(
  {
    pattern: "common ?(.*)",
    fromMe: true,
    desc: "Find common participants in groups and perform actions on them",
    type: "group",
    usage: help,
    onlyGroup: true,
  },
  async (message, match) => {
    const [jidsPart, action] = match.split(";");
    const jids = jidsPart.split(",").map((jid) => jid.trim());
    if (!match) {
      return await message.reply(`use ${PREFIX}common help for more info`);
    }
    if (jids.length < 2) {
      return await message.reply(
        `Please provide at least two group JIDs. use ${PREFIX}help for more info`,
      );
    }
    const admin = await isAdmin(message);
    const BotAdmin = await isBotAdmin(message);

    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;

    return await common(message, jids, action.trim());
  },
);
