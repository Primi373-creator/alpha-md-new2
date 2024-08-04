const { Alpha, GPT, mode, config,getJson} = require('../lib');

Alpha({
    pattern: "gemini",
    desc: 'get gemini ai response',
    type: "Ai",
    fromMe: mode
}, async (message, match) => {
    match = match || message.reply_message.text;

    return await message.reply(text);
});
