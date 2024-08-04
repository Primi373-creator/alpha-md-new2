const {  Alpha, mode, lang, settingsDB,  config } = require('../lib');


Alpha({
    pattern: 'null',
    fromMe: mode,
    desc: lang.SCRAP.RING_DESC,
    react : "🙃",
    type: "group"
}, async (message, match) => {
        if (!match) return message.send(lang.BASE.TEXT);
        let result = await ringtone(match), res=[];
        await result.map(r=>res.push(r.title));
        return await message.send(GenListMessage(lang.SCRAP.RING_LIST, res));
});   


