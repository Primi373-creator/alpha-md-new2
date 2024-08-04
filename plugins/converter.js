const { Alpha, mode, sendPhoto, TTS, IMGUR, sendGif, sendBassAudio, sendSlowAudio, sendBlownAudio, sendDeepAudio, sendErrapeAudio, sendFastAudio, sendFatAudio, sendNightcoreAudio, sendReverseAudio, sendSquirrelAudio, toAudio, toPTT, toVideo, AudioMetaData, lang, config } = require('../lib');

Alpha({
    pattern: 'photo ?(.*)',
    desc: lang.CONVERTER.PHOTO_DESC,
    type: "converter",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.sticker) return  await message.reply(lang.BASE.NEED.format("non animated sticker message"));
    if(message.reply_message.isAnimatedSticker) return  await message.reply(lang.BASE.NEED.format("please reply to a non animated sticker"));
    return await sendPhoto(message);
});
Alpha({
    pattern: 'mp4 ?(.*)',
    desc: lang.CONVERTER.VIDEO_DESC,
    type: "converter",
    fromMe: mode
}, async (message, match) => {
    if (!message.reply_message.sticker) return message.reply(lang.BASE.NEED.format("animated sticker message"));
    if(!message.reply_message.isAnimatedSticker) return  await message.reply(lang.BASE.NEED.format("please reply to an animated sticker"));
    let media = await toVideo(await message.reply_message.download())
    return await message.send(media,{
        mimetype: 'video/mp4',
    },'video')
});
Alpha({
    pattern: 'voice ?(.*)',
    desc: lang.CONVERTER.AUDIO_DESC,
    type: "converter",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("video/audio message"));
    let media = await toPTT(await message.reply_message.download())
    return await message.send(media,{
        mimetype: 'audio/mpeg',
        ptt: true
    }, 'audio')
});
Alpha({
    pattern: 'gif ?(.*)',
    desc: lang.CONVERTER.GIF_DESC,
    type: "converter",
    fromMe: mode
}, async (message) => {
    
    if (!message.reply_message.sticker || message.reply_message.video) return message.reply(lang.BASE.NEED.format("animated sticker/video message"));
    return await sendGif(message)
});
Alpha({
    pattern: 'bass ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendBassAudio(message)
});
Alpha({
    pattern: 'slow ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendSlowAudio(message)
});
Alpha({
    pattern: 'blown ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendBlownAudio(message)
});
Alpha({
    pattern: 'deep ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendDeepAudio(message);
});
Alpha({
    pattern: 'earrape ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendErrapeAudio(message)
});
Alpha({
    pattern: 'fast ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendFastAudio(message)
});
Alpha({
    pattern: 'fat ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendFatAudio(message);
});
Alpha({
    pattern: 'nightcore ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendNightcoreAudio(message);
});
Alpha({
    pattern: 'reverse ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendReverseAudio(message);
});
Alpha({
    pattern: 'squirrel ?(.*)',
    desc: lang.CONVERTER.AUDIO_EDIT_DESC,
    type: "audio-edit",
    fromMe: mode
}, async (message) => {
    if (!message.reply_message.audio) return message.reply(lang.BASE.NEED.format("audio message"));
    return await sendSquirrelAudio(message);
});

Alpha({
    pattern: 'mp3 ?(.*)',
    desc: lang.CONVERTER.MP3_DESC,
    type: "converter",
    fromMe: mode
}, (async (message) => {
    if (!message.reply_message.audio && !message.reply_message.video) return message.reply(lang.BASE.NEED.format("video message"));
    const opt = {
                title: config.AUDIO_DATA.split(/[|,;]/)[0] || config.AUDIO_DATA,
                body: config.AUDIO_DATA.split(/[|,;]/)[1],
                image: config.AUDIO_DATA.split(/[|,;]/)[2]
            }
    const AudioMeta = await AudioMetaData(await toAudio(await message.reply_message.download()), opt);
    return await message.send(AudioMeta,{
        mimetype: 'audio/mpeg'
    },'audio')
}));

Alpha({
    pattern: 'doc ?(.*)',
    desc: "convert media to document",
    react: "🔂",
    type: 'converter',
    fromMe: mode
}, async (message, match) => {
    match = (match || "converted media").replace(/[^A-Za-z0-9]/g,'-');
    if (!message.reply_message.image && !message.reply_message.audio && !message.reply_message.video) {
        return message.reply("_*reply to a video/audio/image message!*_");
    }
    try {
        const media = await message.reply_message.download();
        const { fileTypeFromBuffer } = await import('file-type');
        const { ext, mime } = await fileTypeFromBuffer(media);
        if (!ext || !mime) {
            return message.reply("_*could not determine file type!*_");
        }
        return await message.client.sendMessage(message.jid, {
            document: media,
            mimetype: mime,
            fileName: `${match}.${ext}`
        }, {
            quoted: message
        });
    } catch (error) {
        console.error("Error processing media:", error);
        return message.reply("_*an error occurred while processing the media!*_");
    }
});



Alpha({
    pattern: 'tts',
    fromMe: mode,
    desc: lang.TTS_DESC,
    react: "💔",
    type: "converter"
}, async (message, match) => {
        match = match || message.reply_message.text;
        if (!match) return await message.send(lang.BASE.TEXT);
        let slang = match.match('\\{([a-z]+)\\}');
        let lang = "en";
        if (slang) {
            lang = slang[1];
            match = match.replace(slang[0], '');
        }
        return await message.send(await TTS(match,lang),{
            mimetype: 'audio/ogg; codecs=opus',
            ptt: false
        },'audio');
});

Alpha({
    pattern: 'imgur',
    desc: lang.GENERAL.URL_DESC,
    react: "⛰️",
    fromMe: mode,
    type: "converter"
}, async (message) => {
    if (!message.isMedia) return message.reply(lang.BASE.NEED.format('image/sticker/video/audio'));
    return await IMGUR(message, message.client);
});