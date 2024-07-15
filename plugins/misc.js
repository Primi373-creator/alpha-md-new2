const {
    Alpha,
    commands,
    personalDB,
    getBuffer,
    Bitly,
    sleep,
    lang,
    extractUrlsFromString,
    styletext,
    mode,
  } = require("../lib");
  
  Alpha(
    {
      pattern: "setcmd",
      desc: lang.MEDIA_CMD.SET_DESC,
      react: "😛",
      type: "misc",
      fromMe: true,
      media: "sticker", //you can get this type of active action from 'eval'=>() return lib.commands[0]
    },
    async (message, match) => {
      if (!message.reply_message.msg?.fileSha256)
        return message.send(lang.MEDIA_CMD.CMD_ERROR);
      if (!match) return await message.send(lang.MEDIA_CMD.NO_CMD);
      await personalDB(
        ["sticker_cmd"],
        { content: { [match]: message.reply_message.msg.fileSha256.join("") } },
        "add",
      );
      return await message.reply(lang.BASE.SUCCESS);
    },
  );
  
  Alpha(
    {
      pattern: "dltcmd",
      desc: lang.MEDIA_CMD.DEL_DESC,
      react: "💥",
      type: "misc",
      fromMe: true,
    },
    async (message, match) => {
      if (!match) return await message.send(lang.MEDIA_CMD.NO_CMD);
      await personalDB(["sticker_cmd"], { content: { id: match } }, "delete");
      return await message.reply(lang.BASE.SUCCESS);
    },
  );
  
  Alpha(
    {
      pattern: "getcmd",
      desc: lang.MEDIA_CMD.GET_DESC,
      react: "💥",
      type: "misc",
      fromMe: true,
    },
    async (message, match) => {
      const { sticker_cmd } = await personalDB(
        ["sticker_cmd"],
        { content: {} },
        "get",
      );
      if (!Object.keys(sticker_cmd)[0])
        return await message.send(lang.MEDIA_CMD.NOT_FOUND);
      let cmds = lang.MEDIA_CMD.CMD_LIST + "\n\n";
      let n = 1;
      for (const cmd in sticker_cmd) {
        cmds += "```" + `${n++}  ${cmd}` + "```" + `\n`;
      }
      return await message.reply(cmds);
    },
  );
  
  Alpha(
    {
      pattern: "toggle ?(.*)",
      fromMe: true,
      desc: lang.TOGGLE.DESC,
      type: "misc",
    },
    async (message, match) => {
      if (match == "list") {
        const { toggle } = await personalDB(["toggle"], { content: {} }, "get");
        let list = lang.TOGGLE.LIST;
        if (!Object.keys(toggle)[0]) return await message.send("_Not Found_");
        let n = 1;
        for (const t in toggle) {
          list += `${n++}  ${t}\n`;
        }
        return await message.reply(list);
      }
      let [cmd, tog] = match.split(" "),
        isIn = false;
      if (!cmd || (tog != "off" && tog != "on"))
        return await message.send(lang.TOGGLE.METHODE.format("toggle"));
      commands.map((c) => {
        if (c.pattern && c.pattern.replace(/[^a-zA-Z0-9,+-]/g, "") == cmd) {
          isIn = true;
        }
      });
      await sleep(250);
      tog = tog == "on" ? "true" : "false";
      if (!isIn) return await message.reply(lang.TOGGLE.ERROR);
      if (cmd == "toggle") return await message.send(lang.TOGGLE.ERROR_KILL);
      if (tog == "false") {
        await personalDB(["toggle"], { content: { [cmd]: tog } }, "add");
        return await message.reply(`_${cmd} Enabled._`);
      } else if (tog == "true") {
        await personalDB(["toggle"], { content: { id: cmd } }, "delete");
        return await message.reply(`_${cmd} Disabled._`);
      }
    },
  );
  
  Alpha(
    {
      pattern: "$ssweb",
      desc: "generate screenshot of websites",
      react: "🤩",
      type: "misc",
      fromMe: mode,
    },
    async (message, match) => {
      match = match || message.reply_message.text;
      if (!match)
        return await message.reply(
          "*_give me a website link to get screenshot!!_*",
        );
      const urls = extractUrlsFromString(match);
      if (!urls[0]) return await message.reply("*_Give me a valid url_*");
      const res = await getBuffer(
        `https://screenshot2.vercel.app/api?url=${urls[0]}&width=1280&height=720`,
      );
      return await message.send(res, {}, "image");
    },
  );
  
  const PastebinAPI = require("pastebin-js");
  pastebin = new PastebinAPI("EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL");
  Alpha(
    {
      pattern: "paste",
      desc: "paste quoted-text on pastbin",
      react: "⚒️",
      type: "misc",
      fromMe: mode,
    },
    async (message, match) => {
      let x = match || message.reply_message.text;
      if (!x) {
        return message.reply(
          "*Please reply to a message to create a paste on pastebin.*",
        );
      }
      let data = await pastebin.createPaste(x, "alpha-md");
      return message.reply(
        "_Paste created on pastebin;_\n" + data + "\n*Click to Get Your link*",
      );
    },
  );
  Alpha(
    {
      pattern: "bitly",
      fromMe: mode,
      desc: "Converts Url to bitly",
      type: "misc",
    },
    async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.reply("_Reply to a url or enter a url_");
      const urls = extractUrlsFromString(match);
      if (!urls[0]) return await message.send("*_Give me a valid url_*");
      let short = await Bitly(urls[0]);
      return await message.reply(short.link);
    },
  );
  
  let options;
  const regex = /^[a-zA-Z0-9 ]+$/;
  Alpha(
    {
      pattern: "fancy ?(.*)",
      type: "misc",
      desc: "Style your text creatively.",
      fromMe: mode,
    },
    async (message, match) => {
      if (!match) return await message.reply("_Please provide a text._");
      if (!regex.test(match)) {
        return await message.reply("_Please provide a valid text._");
      }
      const res = await styletext(match);
      if (!res.status)
        return await message.reply(
          "*An error occurred, please try again later.*",
        );
      options = res.alpha;
      if (options.length === 0)
        return await message.reply(
          "*Sorry, fancy text is temporarily unavailable.*",
        );
      let replyMsg = "*Fancy Text Options:*\n";
      options.forEach((option, index) => {
        replyMsg += `${index + 1}. ${option.result}\n`;
      });
      replyMsg +=
        "*Reply with the number of your desired fancy text.*\n*Or 0 to cancel.*";
      await message.reply(replyMsg);
    },
  );
  
  Alpha(
    {
      on: "text",
      fromMe: mode,
    },
    async (message, match) => {
      if (!options || options.length === 0) return;
      if (!message.reply_message?.fromMe || !message.reply_message?.text) return;
      if (
        !message.reply_message.text.includes(
          "*Reply with the number of your desired fancy text.*\n*Or 0 to cancel.*",
        )
      )
        return;
  
      const selection = parseInt(message.body);
      if (selection === 0) {
        await message.reply("*Operation cancelled.*");
        options = [];
        return;
      }
      if (isNaN(selection) || selection < 1 || selection > options.length) {
        await message.reply(
          "*Invalid selection. Please reply with a valid number.*",
        );
        return;
      }
      const selectedOption = options[selection - 1].result;
      await message.reply(`${selectedOption}`);
    },
  );