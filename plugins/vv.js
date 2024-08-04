const { Alpha, mode } = require("../lib");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

Alpha(
  {
    pattern: "vv",
    fromMe: mode,
    desc: "Forwards the viewed message",
    type: "misc",
  },
  async (message) => {
    try {
      const buffer = await downloadMediaMessage(
        message.quoted,
        "buffer",
        {},
        {
          reuploadRequest: message.client.updateMediaMessage,
        },
      );
      await message.sendfiles(message.from, buffer, {
        quoted: message,
      });
    } catch (error) {
      console.log(error);
    }
  },
);
