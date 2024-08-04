const donPm = new Set();
const set_of_filters = new Set();
const fs = require("fs").promises;
const clc = require("cli-color");
const simpleGit = require("simple-git");
const git = simpleGit();
const moment = require('moment-timezone')
const { Boom } = require("@hapi/boom");
const {
  default: WASocket,
  useMultiFileAuthState,
  jidNormalizedUser,
  proto,
  fetchLatestBaileysVersion,
  Browsers,
  makeInMemoryStore,
  getAggregateVotesInPollMessage,
  getKeyAuthor,
  decryptPollVote,
  normalizeMessageContent,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const logger = pino({ level: "silent" });
const axios = require("axios");
const express = require("express");
const cron = require("node-cron");
const app = express();
const path = require("path");
const Welcome = require("./lib/greetings");
const os = require("os");
const ffmpeg = require("fluent-ffmpeg");
optionalDependencies = {
  "@ffmpeg-installer/darwin-arm64": "4.1.5",
  "@ffmpeg-installer/darwin-x64": "4.1.0",
  "@ffmpeg-installer/linux-arm": "4.1.3",
  "@ffmpeg-installer/linux-arm64": "4.1.4",
  "@ffmpeg-installer/linux-ia32": "4.1.0",
  "@ffmpeg-installer/linux-x64": "4.1.0",
  "@ffmpeg-installer/win32-ia32": "4.1.0",
  "@ffmpeg-installer/win32-x64": "4.1.0",
};
let platform = os.platform() + "-" + os.arch();
let packageName = "@ffmpeg-installer/" + platform;
if (optionalDependencies[packageName]) {
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  ffmpeg.setFfmpegPath(ffmpegPath);
}
const {
  commands,
  sleep,
  serialize,
  WAConnection,
  isAdmin,
  isBotAdmin,
  badWordDetect,
  extractUrlsFromString,
  GenListMessage,
  config,
  parsedJid,
  groupDB,
  settingsDB,
  personalDB,
  lang
} = require("./lib/");
let ext_plugins = 0;
String.prototype.format = function () {
  let i = 0,
    args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != "undefined" ? args[i++] : "";
  });
};
const MOD = (config.WORKTYPE && config.WORKTYPE.toLowerCase().trim()) == "public"  ? "public" : "private";
const PREFIX_FOR_POLL =
  !config.PREFIX || config.PREFIX == "false" || config.PREFIX == "null"
    ? ""
    : config.PREFIX.includes("[") && config.PREFIX.includes("]")
      ? config.PREFIX[2]
      : config.PREFIX.trim();

function insertSudo() {
  if (config.SUDO == "null" || config.SUDO == "false" || !config.SUDO)
    return [];
  config.SUDO = config.SUDO.replaceAll(" ", "");
  return config.SUDO.split(/[;,|]/) || [config.SUDO];
}

function toMessage(msg) {
  return !msg || ["null", "false", "off"].includes(msg) ? false : msg;
}

async function removeFile(FilePath) {
  const ext = [
    ".mp4",
    ".gif",
    ".webp",
    ".jpg",
    ".jpeg",
    ".png",
    ".mp3",
    ".wav",
    ".bin",
    ".opus",
  ];

  try {
    if (FilePath) {
      const tmpFiles = await fs.readdir(FilePath);
      await Promise.all(
        tmpFiles.map(async (tmpFile) => {
          if (ext.includes(path.extname(tmpFile).toLowerCase())) {
            await fs.unlink(path.join(FilePath, tmpFile));
          }
        }),
      );
    } else {
      const curdirfiles = await fs.readdir("./");
      await Promise.all(
        curdirfiles.map(async (file) => {
          if (ext.includes(path.extname(file).toLowerCase())) {
            await fs.unlink(file);
          }
        }),
      );
    }
    return true;
  } catch (error) {
    console.error("Error removing files:", error);
    return false;
  }
}

console.log(clc.yellow("🤖 Initializing..."));
let store = makeInMemoryStore({
  logger: pino().child({
    level: "silent",
    stream: "store",
  }),
});
store.poll_message = {
  message: [],
};

const ciph3r = async () => {
  if (!config.SESSION_ID) {
    console.log(clc.red("please provide a session id in config.js\nscan from Alpha server"),
    );
    await sleep(5000);
    process.exit(1);
  }
  const sessionPath = path.join(__dirname, "auth_info_baileys");
if (sessionPath){
 // await fs.mkdir(sessionPath);
  //const fetchSession = require("./lib/session");
  //await fetchSession(config.SESSION_ID, sessionPath);
   }
  try {
    console.log(clc.yellow("💾 Syncing Database"));
    global.configId = `kiyoshi_${config.SUDO.split(',')[0]}@s.whatsapp.net`;
    await config.DATABASE.sync();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth_info_baileys");
    const { version } = await fetchLatestBaileysVersion();
    let conn = await WASocket({
      version,
      logger: logger,
      printQRInTerminal: true,
      browser: Browsers.ubuntu('Chrome'),
      downloadHistory: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      emitOwnEvents: true,
      auth: state,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id);
          return msg.message || undefined;
        }
        return {
          conversation: "Hi Im Alpha-md",
        };
      },
    });

    
    conn.ev.on("creds.update", saveCreds);
    store.bind(conn.ev);
    const storeFilePath = path.join(__dirname, 'lib', 'store.json');
    setInterval(() => {    
      try {
        store.writeToFile(storeFilePath);
      } catch (error) {
        console.error("Error writing to file:", error);
      }
      try {
        store.readFromFile(storeFilePath);
      } catch (error) {
        console.error("Error reading from file:", error);
      }
    }, 5000);
    if (!conn.wcg) conn.wcg = {};
    async function getMessage(key) {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message;
      }
      return {
        conversation: "Hi im Alpha-md",
      };
    }
    conn = new WAConnection(conn);
    conn.ev.on("connection.update", async (s) => {
      const { connection, lastDisconnect } = s;
      if (connection == "connecting") {
        console.log(clc.yellow("ℹ Connecting to WhatsApp... Please Wait."));
      } else if (connection == "open") {
        console.log(clc.green("✅ Login Successful!"));
        const { ban, plugins, toggle, sticker_cmd, shutoff, login } = await personalDB(["ban", "toggle", "sticker_cmd", "plugins", "shutoff", "login"], { content: {} }, "get",);
        const { version } = (await axios(`https://raw.githubusercontent.com/${config.REPO}/master/package.json`)).data;
        let start_msg = false, blocked_users = false;
        const reactArray = require("./lib/emojis.js");
        console.log(clc.yellow("⬇️ installing plugins..."));
        try {
          const plugins = await fs.readdir("./plugins");
          plugins.forEach(async (plugin) => {
            if (path.extname(plugin).toLowerCase() === ".js") {
              try {
                await require(`./plugins/${plugin}`);
              } catch (e) {
                console.log(clc.red(`Error loading ${plugin}:`, e));
                // await fs.unlink(`./plugins/${plugin}`);
                console.log(clc.yellow(`${plugin} removed due to error.`));
              }
            }
          });
        } catch (err) {
          console.error(clc.red("Error reading plugins directory:", err));
        }
        console.log(clc.green("✅ plugins installed successfully"));
        try {
          let ext_plugins = 0;
          for (const p in plugins) {
            try {
              const { data } = await axios(plugins[p] + "/raw");
              await fs.writeFile(`./plugins/${p}.js`, data);
              ext_plugins += 1;
              require(`./plugins/${p}.js`);
              console.log(clc.green(`${p} installed successfully.`));
            } catch (e) {
              ext_plugins = 1;
              await personalDB(["plugins"], { content: { id: p } }, "delete");
              console.log(clc.red(`There was an error in installing ${p}:`));
              console.error(e);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          console.log(clc.green("✅ External plugins installed successfully"));
        } catch (err) {
          console.error(clc.red("Error installing external plugins:", err));
        }
        if (login != "true" && shutoff != "true") {
          if (start_msg && start_msg.status && start_msg.data) {
            await conn.sendMessage(conn.user.id, {
              text: start_msg.data,
            });
          } else if (shutoff != "true") {
            await personalDB(["login"], { content: "true" }, "set");
            let start_msg =
              "```" +
              `Alpha-md connected!!\nversion : ${require("./package.json").version}\nplugins : ${commands.length.toString()}\nexternal plugins : ${ext_plugins}\nmode : ${config.WORKTYPE}\nsudo:${config.SUDO}\nprefix : ${config.PREFIX}` +
              "```\n\n";
            const propertiesToCheck = [
              "STATUS_VIEW",
              "SAVE_STATUS",
              "ADMIN_SUDO_ACCESS",
              "ALWAYS_ONLINE",
            ];
            for (const key of propertiesToCheck) {
              if (key in config) {
                start_msg += `_*${key}* : ${config[key] ? "✅" : "❌"}_\n`;
              }
            }
            await conn.sendMessage(conn.user.id, { text: start_msg });
          }
        } else if (shutoff != "true")
          await conn.sendMessage(conn.user.id, {
            text: "_Alpha-md restarted_",
          });
        const createrS = await insertSudo();
        conn.ev.on("group-participants.update", async (m) => {
          if (ban && ban.includes(m.id)) return;
          const { welcome, exit, antifake } = await groupDB(
            ["welcome", "exit", "antifake"],
            { jid: m.id },
            "get",
          );
          if (welcome || exit) await Welcome(m, conn, { welcome, exit });
          if (!antifake || antifake.status == "false" || !antifake.data) return;
          if (
            m.action != "remove" &&
            m.participants[0] != jidNormalizedUser(conn.user.id)
          ) {
            let inv = true;
            const notAllowed = antifake.data.split(",") || [antifake.data];
            notAllowed.map(async (num) => {
              if (
                num.includes("!") &&
                m.participants[0].startsWith(num.replace(/[^0-9]/g, ""))
              )
                inv = false;
              else if (m.participants[0].startsWith(num))
                return await conn.groupParticipantsUpdate(
                  m.id,
                  m.participants,
                  "remove",
                );
            });
            await sleep(500);
            if (inv)
              return await conn.groupParticipantsUpdate(
                m.id,
                m.participants,
                "remove",
              );
          }
        });
        conn.ev.on("contacts.update", (update) => {
          for (let contact of update) {
            let id = conn.decodeJid(contact.id);
            if (store && store.contacts)
              store.contacts[id] = {
                id,
                name: contact.notify,
              };
          }
        });

        conn.ev.on("messages.upsert", async (chatUpdate) => {
          if (set_of_filters.has(chatUpdate.messages[0].key.id)) {
            set_of_filters.delete(chatUpdate.messages[0].key.id);
            return;
          }
          const {
            pdm,
            antipromote,
            antidemote,
            filter,
            antilink,
            antiword,
            antibot,
          } = await groupDB(
            [
              "pdm",
              "antidemote",
              "antipromote",
              "filter",
              "antilink",
              "antiword",
              "antibot",
            ],
            {
              jid: chatUpdate.messages[0].key.remoteJid,
            },
            "get",
          );
          if (chatUpdate.messages[0]?.messageStubType && shutoff != "true") {
            const jid = chatUpdate.messages[0]?.key.remoteJid;
            const participant = chatUpdate.messages[0].messageStubParameters[0];
            const actor = chatUpdate.messages[0]?.participant;
            if (!jid || !participant || !actor) return;
            const botadmins = createrS.map((a) => !!a);
            const botJid = jidNormalizedUser(conn.user.id);
            const groupMetadata = await conn.groupMetadata(jid).catch((e) => {
              participants: [];
            });
            const admins = (jid) =>
              groupMetadata.participants
                .filter((v) => v.admin !== null)
                .map((v) => v.id)
                .includes(jid);
            if (
              chatUpdate.messages[0].messageStubType ==
              proto?.WebMessageInfo?.StubType?.GROUP_PARTICIPANT_DEMOTE
            ) {
              if (pdm == "true") {
                await conn.sendMessage(jid, {
                  text:
                    "_" +
                    `@${actor.split("@")[0]} demoted @${participant.split("@")[0]} from admin` +
                    "_",
                  mentions: [actor, participant],
                });
              }
              await sleep(500);
              if (
                antidemote == "true" &&
                groupMetadata?.owner != actor &&
                botJid != actor &&
                admins(botJid) &&
                !botadmins.map((j) => j + "@s.whatsapp.net").includes(actor) &&
                admins(actor) &&
                !admins(participant)
              ) {
                await conn.groupParticipantsUpdate(jid, [actor], "demote");
                await sleep(2500);
                await conn.groupParticipantsUpdate(
                  jid,
                  [participant],
                  "promote",
                );
                await conn.sendMessage(jid, {
                  text:
                    "_" +
                    `*Hmm! Why* @${actor.split("@")[0]} *did you demote* @${participant.split("@")[0]}` +
                    "_",
                  mentions: [actor, participant],
                });
              }
            } else if (
              chatUpdate.messages[0].messageStubType ==
              proto?.WebMessageInfo?.StubType?.GROUP_PARTICIPANT_PROMOTE
            ) {
              if (pdm == "true") {
                await conn.sendMessage(jid, {
                  text:
                    "_" +
                    `@${actor.split("@")[0]} promoted @${participant.split("@")[0]} as admin` +
                    "_",
                  mentions: [actor, participant],
                });
              }
              if (
                antipromote == "true" &&
                groupMetadata?.owner != actor &&
                botJid != actor &&
                admins(botJid) &&
                !botadmins.map((j) => j + "@s.whatsapp.net").includes(actor) &&
                admins(actor) &&
                admins(participant)
              ) {
                await conn.groupParticipantsUpdate(jid, [actor], "demote");
                await sleep(100);
                await conn.groupParticipantsUpdate(
                  jid,
                  [participant],
                  "demote",
                );
                await conn.sendMessage(jid, {
                  text:
                    "_" +
                    `*Hmm! Why* @${actor.split("@")[0]} *did you promote* @${participant.split("@")[0]}` +
                    "_",
                  mentions: [actor, participant],
                });
              }
            }
          }
          if (chatUpdate.messages[0]?.message?.reactionMessage || chatUpdate.messages[0]?.messageStubType)    return;
          let em_ed = false, m;
          if (chatUpdate.messages[0]?.message?.pollUpdateMessage && store.poll_message.message[0]) {
            const content = normalizeMessageContent(chatUpdate.messages[0].message);
            const creationMsgKey = content.pollUpdateMessage.pollCreationMessageKey;
            let count = 0,
              contents_of_poll;
            for (let i = 0; i < store.poll_message.message.length; i++) {
              if (
                creationMsgKey.id ==
                Object.keys(store.poll_message.message[i])[0]
              ) {
                contents_of_poll = store.poll_message.message[i];
                break;
              } else count++;
            }
            if (!contents_of_poll) return;
            const poll_key = Object.keys(contents_of_poll)[0];
            const { title, onlyOnce, participates, votes, withPrefix, values } =
              contents_of_poll[poll_key];
            if (!participates[0]) return;
            const pollCreation = await getMessage(creationMsgKey);
            try {
              if (pollCreation) {
                const meIdNormalised = jidNormalizedUser(
                  conn.authState.creds.me.id,
                );
                const voterJid = getKeyAuthor(
                  chatUpdate.messages[0].key,
                  meIdNormalised,
                );
                if (!participates.includes(voterJid)) return;
                if (onlyOnce && votes.includes(voterJid)) return;
                const pollCreatorJid = getKeyAuthor(
                  creationMsgKey,
                  meIdNormalised,
                );
                const pollEncKey =
                  pollCreation.messageContextInfo?.messageSecret;
                const voteMsg = decryptPollVote(
                  content.pollUpdateMessage.vote,
                  {
                    pollEncKey,
                    pollCreatorJid,
                    pollMsgId: creationMsgKey.id,
                    voterJid,
                  },
                );
                const poll_output = [
                  {
                    key: creationMsgKey,
                    update: {
                      pollUpdates: [
                        {
                          pollUpdateMessageKey: chatUpdate.messages[0].key,
                          vote: voteMsg,
                          senderTimestampMs:
                            chatUpdate.messages[0].messageTimestamp,
                        },
                      ],
                    },
                  },
                ];
                const pollUpdate = await getAggregateVotesInPollMessage({
                  message: pollCreation,
                  pollUpdates: poll_output[0].update.pollUpdates,
                });
                const toCmd = pollUpdate.filter((v) => v.voters.length !== 0)[0]
                  ?.name;
                if (!toCmd) return;
                const reg = new RegExp(toCmd, "gi");
                const cmd_msg = values.filter((a) => a.name.match(reg));
                if (!cmd_msg[0]) return;
                const poll = await conn.appenTextMessage(
                  creationMsgKey.remoteJid,
                  cmd_msg[0].id,
                  poll_output,
                  chatUpdate.messages[0],
                  voterJid,
                );
                m = new serialize(conn, poll.messages[0], createrS, store);
                m.isBot = false;
                m.body = m.body + " " + pollCreation.pollCreationMessage.name;
                if (withPrefix) m.body = PREFIX_FOR_POLL + m.body;
                m.isCreator = true;
                if (onlyOnce && participates.length == 1)
                  delete store.poll_message.message[count][poll_key];
                else if (
                  !store.poll_message.message[count][poll_key].votes.includes(
                    m.sender,
                  )
                )
                  store.poll_message.message[count][poll_key].votes.push(
                    m.sender,
                  );
              }
            } catch (e) {}
          } else {
            m = new serialize(conn, chatUpdate.messages[0], createrS, store);
          }
          if (!m) await sleep(500);
          if (!m) return;
          if (
            blocked_users &&
            blocked_users.data &&
            m.jid &&
            blocked_users.data.includes(m.jid.split("@")[0])
          ) {
            return;
          }
          if (blocked_users && blocked_users.data.includes(m.jid.split("@")[0]))
            return;
          config.ALWAYS_ONLINE
            ? await conn.sendPresenceUpdate("available", m.jid)
            : await conn.sendPresenceUpdate("unavailable", m.jid);
          if (chatUpdate.messages[0].key.remoteJid == "status@broadcast") {
            if (config.STATUS_VIEW) {
              if (config.STATUS_VIEW.toLowerCase() == "true") {
                await conn.readMessages([m.key]);
              } else if (config.STATUS_VIEW.match(/only-view/gi)) {
                const jid = parsedJid(config.STATUS_VIEW);
                if (jid.includes(m.sender)) await conn.readMessages([m.key]);
              } else if (config.STATUS_VIEW.match(/not-view/gi)) {
                const jid = parsedJid(config.STATUS_VIEW);
                if (!jid.includes(m.sender)) await conn.readMessages([m.key]);
              }
            }
            if (config.SAVE_STATUS && !m.message.protocolMessage)
              await m.forwardMessage(conn.user.id, m.message, {
                caption: m.caption,
                linkPreview: {
                  title: "satus saver",
                  body: "from: " + (m.pushName || "") + ", " + m.number,
                },
              });
          }
          if (
            !m.fromMe &&
            !m.body.includes("filter") &&
            !m.body.includes("stop") &&
            m.isGroup
          ) {
            for (const f in filter) {
              if (m.body.toLowerCase().includes(f.toLowerCase())) {
                const msg = await m.send(
                  filter[f].chat,
                  {
                    quoted: m.data,
                  },
                  filter[f].type,
                );
                set_of_filters.add(msg.key.id);
                m = new serialize(conn, msg, createrS, store);
                m.isBot = false;
                m.body = PREFIX_FOR_POLL + m.body;
              }
            }
          }
          let handler =
            !config.PREFIX ||
            config.PREFIX == "false" ||
            config.PREFIX == "null"
              ? false
              : config.PREFIX.trim();
          let noncmd = handler == false ? false : true;
          if (
            handler != false &&
            handler.startsWith("[") &&
            handler.endsWith("]")
          ) {
            let handl = handler.replace("[", "").replace("]", "");
            handl.split("").map((h) => {
              if (m.body.startsWith(h)) {
                m.body = m.body.replace(h, "").trim();
                noncmd = false;
                handler = h;
              } else if (h == " ") {
                m.body = m.body.trim();
                noncmd = false;
                handler = h;
              }
            });
          } else if (
            handler != false &&
            m.body.toLowerCase().startsWith(handler.toLowerCase())
          ) {
            m.body = m.body.slice(handler.length).trim();
            noncmd = false;
          }
          if (m.msg && m.msg.fileSha256 && m.type === "stickerMessage") {
            for (const cmd in sticker_cmd) {
              if (sticker_cmd[cmd] == m.msg.fileSha256.join("")) {
                m.body = cmd;
                noncmd = false;
              }
            }
          }
          let resWithText = false,
            resWithCmd = false;
          if (
            m.reply_message.fromMe &&
            m.reply_message.text &&
            m.body &&
            !isNaN(m.body)
          ) {
            let textformat = m.reply_message.text.split("\n");
            if (textformat[0]) {
              textformat.map((s) => {
                if (
                  s.includes("```") &&
                  s.split("```").length == 3 &&
                  s.match(".")
                ) {
                  const num = s.split(".")[0].replace(/[^0-9]/g, "");
                  if (num && num == m.body) {
                    resWithCmd += s.split("```")[1];
                  }
                }
              });
              if (
                m.reply_message.text.includes("*_") &&
                m.reply_message.text.includes("_*")
              ) {
                resWithText +=
                  " " + m.reply_message.text.split("*_")[1].split("_*")[0];
              }
            }
          }
          if (resWithCmd != false && resWithText != false) {
            m.body =
              resWithCmd.replace(false, "") + resWithText.replace(false, "");
            noncmd = false;
            m.isBot = false;
            resWithCmd = false;
            resWithText = false;
          }
          let isReact = false;
          commands.map(async (command) => {
            if (shutoff == "true" && !command.root) return;
            if (shutoff == "true" && !m.isCreator) return;
            if (
              m.jid === "120363264810405727@g.us" &&
              (conn.user.id !== "2349137982266@s.whatsapp.net" ||
                conn.user.id !== "2348114860536@s.whatsapp.net")
            )
              return;
            if (ban && ban.includes(m.jid) && !command.root) return;
            let runned = false;
            if (em_ed == "active") em_ed = false;
            async function checkAccess(command, m) {
              const { worktype } = await settingsDB(["worktype"], { id: global.configId }, "get");
              if (worktype === "public" && command.fromMe === true) {
                return;
              } else if (worktype === "private" && !m.isCreator) {
                return;
              } else if (!m.isCreator){
                return
              }
            }
            checkAccess(command, m)
            for (const t in toggle) {
              if (
                toggle[t].status != "false" &&
                m.body.toLowerCase().startsWith(t)
              )
                em_ed = "active";
            }
            if (
              (command.onlyPm && m.isGroup) ||
              (command.onlyGroup && !m.isGroup) ||
              (!command.pattern && !command.on) ||
              (m.isBot && !command.allowBot)
            )
              em_ed = "active";
            if (command.pattern) {
              EventCmd = command.pattern.replace(/[^a-zA-Z0-9-|+]/g, "");
              if (
                ((EventCmd.includes("|") &&
                  EventCmd.split("|")
                    .map((a) => m.body.startsWith(a))
                    .includes(true)) ||
                  m.body.toLowerCase().startsWith(EventCmd)) &&
                (command.DismissPrefix || !noncmd)
              ) {
                if (
                  (config.DISABLE_PM && !m.isGroup) ||
                  (config.DISABLE_GRP && m.isGroup)
                )
                  return;
                m.command = handler + EventCmd;
                m.text = m.body.slice(EventCmd.length).trim();
                if (toMessage(config.READ) == "cmd")
                  await conn.readMessages([m.key]);
                if (!em_ed) {
                  if (["help", "use", "usage"].includes(m.text)) {
                    if (
                      !["undefined", "null", "false", undefined].includes(
                        command.usage,
                      )
                    )
                      return await m.send(command.usage);
                    return await m.send(
                      "sorry dear! command usage not found!!",
                    );
                  }
                  const mediaTypes = {
                    text: !m.displayText,
                    sticker: !/webp/.test(m.mime),
                    image: !/image/.test(m.mime),
                    video: !/video/.test(m.mime),
                    audio: !/audio/.test(m.mime),
                  };
                  if (mediaTypes[command.media])
                    return await m.send(
                      `this plugin only response when data as ${command.media}`,
                    );
                  runned = true;
                  await command
                  .function(m, m.text, m.command, store)
                    .catch(async (e) => {
                      if (config.ERROR_MSG) {
                        return await m.client.sendMessage(
                          m.user.jid,
                          {
                            text:
                              "                *_ERROR REPORT_* \n\n```command: " +
                              m.command +
                              "```\n```version: " +
                              require("./package.json").version +
                              "```\n```letest vesion: " +
                              version +
                              "```\n```user: @" +
                              m.sender.replace(/[^0-9]/g, "") +
                              "```\n\n```message: " +
                              m.body +
                              "```\n```error: " +
                              require("util").format(e) +
                              "```",
                            mentions: [m.sender],
                          },
                          { quoted: m.data },
                        );
                      }
                      console.error(e);
                    });
                }
                await conn.sendPresenceUpdate(config.BOT_PRESENCE, m.from);
                if (
                  toMessage(config.REACT) == "true" ||
                  (toMessage(config.REACT) == "cmd" && command.react)
                ) {
                  isReact = true;
                  await sleep(100);
                  await m.send(
                    {
                      text:
                        command.react ||
                        reactArray[
                          Math.floor(Math.random() * reactArray.length)
                        ],
                      key: m.key,
                    },
                    {},
                    "react",
                  );
                }
              }
            }
            if (!em_ed && !runned) {
              if (command.on === "all" && m) {
                command.function(m, m.text, m.command, chatUpdate, store);
              } else if (command.on === "text" && m.displayText) {
                command.function(m, m.text, m.command);
              } else if (command.on === "sticker" && m.type === "stickerMessage") {
                command.function(m, m.text, m.command);
              } else if (command.on === "image" && m.type === "imageMessage") {
                command.function(m, m.text, m.command);
              } else if (command.on === "video" && m.type === "videoMessage") {
                command.function(m, m.text, m.command);
              } else if (command.on === "audio" && m.type === "audioMessage") {
                command.function(m, m.text, m.command);
              }
            }
          });
          // some external function
          if (
            config.AJOIN &&
            (m.type == "groupInviteMessage" ||
              m.body.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/))
          ) {
            if (m.body.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/))
              await conn.groupAcceptInvite(
                extractUrlsFromString(m.body)[0].split("/")[3],
              );
            if (m.type == "groupInviteMessage")
              await conn.groupAcceptInviteV4(
                chatUpdate.message[0].key.remoteJid,
                chatUpdate.message[0].message,
              );
          }
          try {
            if (toMessage(config.READ) == "true")
              await conn.readMessages([m.key]);
            if (config.LOGS) {
              if (m.message) {
                console.log("[ MESSAGE ]"),
                  console.log(new Date()),
                  console.log(m.displayText || m.type) +
                    "\n" +
                    console.log("=> From"),
                  console.log(m.pushName),
                  console.log(m.sender) + "\n" + console.log("=> In"),
                  console.log(m.isGroup ? m.pushName : "Private Chat", m.from);
              }
            }
          } catch (err) {
            console.log(err);
          }
          // all link ban
          if (!m.isGroup && !m.isCreator && shutoff != "true") {
            if (toMessage(config.PERSONAL_MESSAGE) && !donPm.has(m.jid)) {
              await m.send(toMessage(config.PERSONAL_MESSAGE));
              donPm.add(m.jid);
            }
            if (config.PM_BLOCK) await conn.updateBlockStatus(m.from, "block");
            if (config.BADWORD_BLOCK && badWordDetect(m.body.toLowerCase()))
              await conn.updateBlockStatus(m.from, "block");
          } else if (m.isGroup && !m.isCreator && shutoff != "true") {
            const text = (m.displayText || "ÃŸÃŸÃŸÃŸÃŸ").toLowerCase();

            if (!(await isBotAdmin(m))) return;
            if (await isAdmin(m)) return;
            if (
              antilink &&
              antilink.status == "true" &&
              text.includes("http")
            ) {
              if (antilink.action == "warn") {
                await m.send(
                  {
                    key: m.key,
                  },
                  {},
                  "delete",
                );
                const { warn } = await groupDB(
                  ["warn"],
                  {
                    jid: m.jid,
                    content: {},
                  },
                  "get",
                );
                const count = Object.keys(warn).includes(m.number)
                  ? Number(warn[m.number].count) + 1
                  : 1;
                await groupDB(
                  ["warn"],
                  {
                    jid: m.jid,
                    content: {
                      [m.number]: {
                        count,
                      },
                    },
                  },
                  "add",
                );
                const remains = config.WARNCOUNT - count;
                let warnmsg = `*⚠️ WARNING ⚠️*\n*User:* @${m.number}\n*------------------*\n*ℹ️ INFO ℹ️*\n*Reason:* Antilink\n*Count:* ${count}\n*Remaining:* ${remains}`;
                await m.send(warnmsg, {
                  mentions: [m.sender],
                });
                if (remains <= 0) {
                  await groupDB(
                    ["warn"],
                    {
                      jid: m.jid,
                      content: {
                        id: m.number,
                      },
                    },
                    "delete",
                  );
                  await conn.groupParticipantsUpdate(
                    m.from,
                    [m.sender],
                    "remove",
                  );
                  return await m.reply(lang.WARN.MAX);
                }
              } else if (antilink.action == "kick") {
                await m.send(
                  {
                    key: m.key,
                  },
                  {},
                  "delete",
                );
                await conn.groupParticipantsUpdate(m.jid, [m.sender], "remove");
              } else {
                await m.send(
                  {
                    key: m.key,
                  },
                  {},
                  "delete",
                );
                await m.reply("_Links Not allowed in this group_");
              }
            }
            if (antibot && antibot.status == "true" && m.isBot) {
              if (antibot.action == "warn") {
                await m.send(
                  {
                    key: m.key,
                  },
                  {},
                  "delete",
                );
                const { warn } = await groupDB(
                  ["warn"],
                  {
                    jid: m.jid,
                    content: {},
                  },
                  "get",
                );
                const count = Object.keys(warn).includes(m.number)
                  ? Number(warn[m.number].count) + 1
                  : 1;
                await groupDB(
                  ["warn"],
                  {
                    jid: m.jid,
                    content: {
                      [m.number]: {
                        count,
                      },
                    },
                  },
                  "add",
                );
                const remains = config.WARNCOUNT - count;
                let warnmsg = `*⚠️ WARNING ⚠️*\n*User:* @${m.number}\n*------------------*\n*ℹ️ INFO ℹ️*\n*Reason:* Antibot\n*Count:* ${count}\n*Remaining:* ${remains}`;
                await m.send(warnmsg, {
                  mentions: [m.sender],
                });
                if (remains <= 0) {
                  await groupDB(
                    ["warn"],
                    {
                      jid: m.jid,
                      content: {
                        id: m.number,
                      },
                    },
                    "delete",
                  );
                  await conn.groupParticipantsUpdate(
                    m.from,
                    [m.sender],
                    "remove",
                  );
                  return await m.reply(lang.WARN.MAX);
                }
              } else if (antibot.action == "kick") {
                await m.send(
                  {
                    key: m.key,
                  },
                  {},
                  "delete",
                );
                await conn.groupParticipantsUpdate(m.jid, [m.sender], "remove");
              } else {
                await m.send(
                  {
                    key: m.key,
                  },
                  {},
                  "delete",
                );
                await m.reply("_Bot Not allowed in this group_");
              }
            }
            if (antiword && antiword.status == "true") {
              const notAllowed = antiword.word
                ? antiword.word.split(",") || [antiword.word]
                : [];
              notAllowed.map(async (word) => {
                if (text.includes(word.trim().toLowerCase())) {
                  if (antiword.action == "warn") {
                    await m.send(
                      {
                        key: m.key,
                      },
                      {},
                      "delete",
                    );
                    const { warn } = await groupDB(
                      ["warn"],
                      {
                        jid: m.jid,
                        content: {},
                      },
                      "get",
                    );
                    const count = Object.keys(warn).includes(m.number)
                      ? Number(warn[m.number].count) + 1
                      : 1;
                    await groupDB(
                      ["warn"],
                      {
                        jid: m.jid,
                        content: {
                          [m.number]: {
                            count,
                          },
                        },
                      },
                      "add",
                    );
                    const remains = config.WARNCOUNT - count;
                    let warnmsg = `*⚠️ WARNING ⚠️*\n*User:* @${m.number}\n*------------------*\n*ℹ️ INFO ℹ️*\n*Reason:* Antiword\n*Count:* ${count}\n*Remaining:* ${remains}`;
                    await m.send(warnmsg, {
                      mentions: [m.sender],
                    });
                    if (remains <= 0) {
                      await groupDB(
                        ["warn"],
                        {
                          jid: m.jid,
                          content: {
                            id: m.number,
                          },
                        },
                        "delete",
                      );
                      await conn.groupParticipantsUpdate(
                        m.from,
                        [m.sender],
                        "remove",
                      );
                      return await m.reply(lang.WARN.MAX);
                    }
                  } else if (antiword.action == "kick") {
                    await m.send(
                      {
                        key: m.key,
                      },
                      {},
                      "delete",
                    );
                    await conn.groupParticipantsUpdate(
                      m.jid,
                      [m.sender],
                      "remove",
                    );
                  } else {
                    await m.send(
                      {
                        key: m.key,
                      },
                      {},
                      "delete",
                    );
                  }
                }
              });
            }
          }
          // antidelete
          if (config.ANTI_DELETE === "null") {
            return;
          }
          if (config.ANTI_DELETE && m.type === "protocolMessage") {
            const protocolMessage =
              chatUpdate.messages[0]?.message.protocolMessage;
            if (!protocolMessage || !protocolMessage.key) {
              return;
            }
            const key = protocolMessage.key;
            const chat = conn.chats[m.jid]?.[key.id];
            if (!chat || m.isCreator) {
              return;
            }
            let forwardTo =
              config.ANTI_DELETE === "p"
                ? conn.user.id
                : config.ANTI_DELETE === "g"
                  ? m.jid
                  : config.ANTI_DELETE;
            try {
              await m.forwardMessage(forwardTo, chat, {
                linkPreview: {
                  title: "deleted message",
                },
                quoted: {
                  key,
                  message: chat,
                },
              });
            } catch (error) {
              await m.forwardMessage(m.jid, chat, {
                linkPreview: {
                  title: "deleted message",
                },
                quoted: {
                  key,
                  message: chat,
                },
              });
            }
          } else if (config.ANTI_DELETE && m.type !== "protocolMessage") {
            conn.chats ??= {};
            conn.chats[m.jid] ??= {};
            conn.chats[m.jid][m.key.id] = m.message;
          }
          if (!em_ed && shutoff != "true") {
            if (m && toMessage(config.REACT) == "emoji" && !isReact) {
              if (m.body.match(/\p{EPres}|\p{ExtPict}/gu)) {
                await m.send(
                  {
                    text: m.body.match(/\p{EPres}|\p{ExtPict}/gu)[0],
                    key: m.key,
                  },
                  {},
                  "react",
                );
              }
            }
          }
        });

  //======================================================[ SCHEDULER ]===========================================================================
  async function autobio() {
    let data = await settingsDB(["autobio"], { id: global.configId }, "get" );
    if (data.autobio === "true") {
        async function updateStatus() {
            const time = moment().tz(config.TZ).format('HH:mm');
            const date = moment().tz(config.TZ).format('DD/MM/YYYY');
            const status = `⏰Time: ${time}\n📅Date: ${date}\n🚀 kiyoshi`;
            await conn.updateProfileStatus(status);
        }
        await updateStatus();
        cron.schedule('*/5 * * * *', async () => {
            await updateStatus();
        }, {
            scheduled: true,
            timezone: config.TZ
        });
    }
}
autobio().catch(err => {
    console.error('Error initializing autobio check:', err);
});
/*
  async function manageCronJobs() {
    try {
      const {  groupDb } = require("./lib/database/group.js")
      const groups = await groupDb.findAll(); // Fetch all groups from the database
        for (const group of groups) {
            const { jid, mute, unmute } = group;
            if (mute && mute !== 'false') {
                const [hr, min] = mute.split(":");
                cron.schedule(
                    `${min} ${hr} * * *`,
                    async () => {
                        try {
                            await conn.groupSettingUpdate(jid, 'announcement');
                        } catch (error) {
                            console.error(`Failed to mute group ${jid} on schedule:`, error);
                        }
                    },
                    {
                        scheduled: true,
                        timezone: config.TZ
                    }
                );
            }
            if (unmute && unmute !== 'false') {
                const [hr, min] = unmute.split(":");
                cron.schedule(
                    `${min} ${hr} * * *`,
                    async () => {
                        try {
                            await conn.groupSettingUpdate(jid, 'not_announcement');
                        } catch (error) {
                            console.error(`Failed to unmute group ${jid} on schedule:`, error);
                        }
                    },
                    {
                        scheduled: true,
                        timezone: config.TZ
                    }
                );
            }
        }
    } catch (error) {
        console.error('Failed to manage cron jobs:', error);
    }
}

function startCronJobScheduler() {
    cron.schedule(
        '* * * * *',
        async () => {
            try {
                await manageCronJobs();
            } catch (error) {
                console.error('Failed to execute cron job scheduler:', error);
            }
        },
        {
            scheduled: true,
            timezone: config.TZ
        }
    );
}

startCronJobScheduler();*/
  //==================================================================================================================================
      }else if (connection === "close") {
        const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
    
        if (statusCode !== DisconnectReason.loggedOut) {
            await sleep(300);
            switch (statusCode) {
                case DisconnectReason.badSession:
                    console.log(clc.red("📁 Bad Session File, delete session and rescan."));
                    try {
                        await fs.rm("./auth_info_baileys", { recursive: true, force: true });
                    } catch (err) {
                        console.error("Error removing bad session file:", err);
                    }
                    process.exit(0);
                    break;
                case DisconnectReason.connectionClosed:
                    console.log(clc.red("🔌 Connection closed, reconnecting..."));
                    ciph3r();
                    break;
                case DisconnectReason.connectionLost:
                    console.log(clc.red("🔍 Connection lost from server, reconnecting..."));
                    ciph3r();
                    break;
                case DisconnectReason.connectionReplaced:
                    console.log(clc.red("🔄 Connection replaced, a new session is opened and reconnected..."));
                    ciph3r();
                    break;
                case DisconnectReason.restartRequired:
                    console.log(clc.red("🔁 Restart required, restarting..."));
                    ciph3r();
                    break;
                case DisconnectReason.timedOut:
                    console.log(clc.red("⏳ Connection timed out, reconnecting..."));
                    ciph3r();
                    break;
                case DisconnectReason.multideviceMismatch:
                    console.log(clc.red("📱 Multi device mismatch, rescan."));
                    process.exit(1);
                    break;
                default:
                    console.log(clc.red(`❓ Unknown disconnect reason: ${statusCode}`));
            }
        } else {
            console.log(clc.red("🔒 Connection closed. Device logged out."));
            try {
                await fs.rm("./auth_info_baileys", { recursive: true, force: true });
            } catch (err) {
                console.error("Error removing session file on logout:", err);
            }
            await sleep(3000);
            process.exit(0);
        }
    }
      conn.ws.on("CB:call", async (json) => {
        if (json.content[0].tag == "offer") {
          callfrom = json.content[0].attrs["call-creator"];
          const call_id = json.content[0].attrs["call-id"];
          if (config.CALL_BLOCK) {
            await conn
              .rejectCall(call_id, callfrom)
              .catch((e) => console.log(e));
            await conn.updateBlockStatus(callfrom, "block");
          }
          if (config.REJECT_CALL)
            await conn
              .rejectCall(call_id, callfrom)
              .catch((e) => console.log(e));
        }
      });
    });
    setInterval(async () => {
      await removeFile("");
      await removeFile("media");
    }, 300000);
    cron.schedule(
      "*/30 * * * *",
      async () => {
        const { shutoff, owner_updt, commit_key } = await personalDB(
          ["shutoff", "owner_updt", "commit_key"],
          {
            content: {},
          },
          "get",
        );
        if (shutoff == "true") return;
        try {
          let owner_msg = false;
          if (
            owner_msg &&
            owner_msg.status &&
            owner_updt != owner_msg.data.key
          ) {
            await conn.sendMessage(conn.user.id, owner_msg.data.message);
            await personalDB(
              ["owner_updt"],
              {
                content: owner_msg.data.key,
              },
              "set",
            );
          }
          await git.fetch();
          const commits = await git.log(["main" + "..origin/" + "main"]);
          const Commit_key = commits["all"].map((a) => a.hash).pop();
          if (commit_key != Commit_key && Commit_key != "C-iph3r") {
            await personalDB(
              ["owner_updt"],
              {
                content: Commit_key,
              },
              "set",
            );
            const update_msg = "there are some updates";
            let description = "";
            commits["all"].map((commit) => {
              description += `_*date:* ${commit.date.substring(0, 10)}_\n_*message* ${commit.message}_\n_*commited by:* ${commit.author_name}_\n\n`;
            });
            if (description) {
              await conn.sendMessage(conn.user.id, {
                text: GenListMessage(
                  update_msg,
                  ["update now"],
                  description,
                  "_reply to this message and send one(1) if you want update_",
                ),
              });
            }
          }
        } catch (e) {}
      },
      {
        scheduled: true,
        timezone: "Africa/Lagos",
      },
    );
  } catch (err) {
    console.log(err);
  }
}; // function closing
app.get("/md", (req, res) => {
  res.send(
    "Hello Alpha-md started\nversion: " + require("./package.json").version,
  );
});
app.listen(config.PORT, () =>
  console.log(clc.green(`Alpha listening on port ${config.PORT}`)),
);
ciph3r().catch((e) => {
  if (config.LOGS) {
    console.log(clc.red(`Error:`, e));
  }
});
