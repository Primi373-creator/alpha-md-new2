const {  Alpha, mode, lang, settingsDB,  PREFIX } = require('../lib');


Alpha({
    pattern: 'autobio',
    fromMe: true,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "settings"
}, async (message, match) => {
    let data = await settingsDB(["autobio"], { id: global.configId }, "get" );
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (match.toLowerCase() === "on") {
        if (data.autobio === "true") {
            await message.send(`*Auto bio is already turned on.*`);
        } else {
            await settingsDB(["autobio"], { id: global.configId, content: "true" }, "set" );
            await message.send(`*Auto bio turned on*`);
        }
    } else if (match.toLowerCase() === "off") {
        if (data.autobio === "false") {
            await message.send(`*Auto bio is already turned off.*`);
        } else {
            await settingsDB(["autobio"], { id: global.configId, content: "false" },"set");
            await message.send(`*Auto bio turned off*`);
        }
    } else {
        await message.send(`*Invalid command. Use "on" to enable or "off" to disable.*`);
    }
});

Alpha({
    pattern: 'alwaysonline',
    fromMe: true,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "settings"
}, async (message, match) => {
    let data = await settingsDB(["alwaysonline"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (match.toLowerCase() === "on") {
        if (data.alwaysonline === "true") {
            await message.send(`*Always online is already turned on.*`);
        } else {
            await settingsDB(["alwaysonline"], { id: global.configId, content: "true" }, "set");
            await message.send(`*Always online turned on*`);
        }
    } else if (match.toLowerCase() === "off") {
        if (data.alwaysonline === "false") {
            await message.send(`*Always online is already turned off.*`);
        } else {
            await settingsDB(["alwaysonline"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Always online turned off*`);
        }
    } else {
        await message.send(`*Invalid command. Use "on" to enable or "off" to disable.*`);
    }
});

Alpha({
    pattern: 'readstatus',
    fromMe: true,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "settings"
}, async (message, match) => {
    let data = await settingsDB(["auto_read_status"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (match.toLowerCase() === "on") {
        if (data.auto_read_status === "true") {
            await message.send(`*Auto read status is already turned on.*`);
        } else {
            await settingsDB(["auto_read_status"], { id: global.configId, content: "true" }, "set");
            await message.send(`*Auto read status turned on*`);
        }
    } else if (match.toLowerCase() === "off") {
        if (data.auto_read_status === "false") {
            await message.send(`*Auto read status is already turned off.*`);
        } else {
            await settingsDB(["auto_read_status"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Auto read status turned off*`);
        }
    } else {
        await message.send(`*Invalid command. Use "on" to enable or "off" to disable.*`);
    }
});

Alpha({
    pattern: 'savestatus',
    fromMe: true,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "settings"
}, async (message, match) => {
    let data = await settingsDB(["auto_save_status"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (match.toLowerCase() === "on") {
        if (data.auto_save_status === "true") {
            await message.send(`*Auto save status is already turned on.*`);
        } else {
            await settingsDB(["auto_save_status"], { id: global.configId, content: "true" }, "set");
            await message.send(`*Auto save status turned on*`);
        }
    } else if (match.toLowerCase() === "off") {
        if (data.auto_save_status === "false") {
            await message.send(`*Auto save status is already turned off.*`);
        } else {
            await settingsDB(["auto_save_status"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Auto save status turned off*`);
        }
    } else {
        await message.send(`*Invalid command. Use "on" to enable or "off" to disable.*`);
    }
});

Alpha({
    pattern: 'worktype',
    fromMe: true,
    desc: 'Set the bot mode to public or private',
    react: "🛠️",
    type: "settings"
}, async (message, match) => {
    const text = match.trim().toLowerCase();
    let data = await settingsDB(["worktype"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (text === "public") {
        if (data.worktype === "public") {
            await message.send(`*Bot is already set to public mode.*`);
        } else {
            await settingsDB(["worktype"], { id: global.configId, content: "public" }, "set");
            await message.send(`*Bot set to public mode*`);
        }
    } else if (text === "private") {
        if (data.worktype === "private") {
            await message.send(`*Bot is already set to private mode.*`);
        } else {
            await settingsDB(["worktype"], { id: global.configId, content: "private" }, "set");
            await message.send(`*Bot set to private mode*`);
        }
    } else {
        await message.send(`*Please use Example: ${PREFIX}worktype public/private*`);
    }
});

Alpha({
    pattern: 'anticall',
    fromMe: true,
    desc: 'Set the anti call status',
    react: "📞",
    type: "settings"
}, async (message, match) => {
    const text = match.trim().toLowerCase();
    let data = await settingsDB(["anticall"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (text === "reject") {
        if (data.anticall === "reject") {
            await message.send(`*Anti call status is already set to reject all calls.*`);
        } else {
            await settingsDB(["anticall"], { id: global.configId, content: "reject" }, "set");
            await message.send(`*Anti call status set to reject all calls*`);
        }
    } else if (text === "block") {
        if (data.anticall === "block") {
            await message.send(`*Anti call status is already set to block all callers.*`);
        } else {
            await settingsDB(["anticall"], { id: global.configId, content: "block" }, "set");
            await message.send(`*Anti call status set to block all callers*`);
        }
    } else if (text === "off") {
        if (data.anticall === "false") {
            await message.send(`*Anti call is already turned off.*`);
        } else {
            await settingsDB(["anticall"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Anti call turned off*`);
        }
    } else {
        await message.send(`*Please use Example: ${PREFIX}anticall reject/block/off*`);
    }
});

Alpha({
    pattern: 'wapresence',
    fromMe: true,
    desc: 'Set the WhatsApp presence status',
    react: "🕵️",
    type: "settings"
}, async (message, match) => {
    const text = match.trim().toLowerCase();
    let data = await settingsDB(["wapresence"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (text === "unavailable") {
        if (data.wapresence === "unavailable") {
            await message.send(`*WhatsApp presence status is already set to unavailable.*`);
        } else {
            await settingsDB(["wapresence"], { id: global.configId, content: "unavailable" }, "set");
            await message.send(`*WhatsApp presence status updated to unavailable*`);
        }
    } else if (text === "available") {
        if (data.wapresence === "available") {
            await message.send(`*WhatsApp presence status is already set to available.*`);
        } else {
            await settingsDB(["wapresence"], { id: global.configId, content: "available" }, "set");
            await message.send(`*WhatsApp presence status updated to available*`);
        }
    } else if (text === "composing") {
        if (data.wapresence === "composing") {
            await message.send(`*WhatsApp presence status is already set to composing.*`);
        } else {
            await settingsDB(["wapresence"], { id: global.configId, content: "composing" }, "set");
            await message.send(`*WhatsApp presence status updated to composing*`);
        }
    } else if (text === "recording") {
        if (data.wapresence === "recording") {
            await message.send(`*WhatsApp presence status is already set to recording.*`);
        } else {
            await settingsDB(["wapresence"], { id: global.configId, content: "recording" }, "set");
            await message.send(`*WhatsApp presence status updated to recording*`);
        }
    } else if (text === "paused") {
        if (data.wapresence === "paused") {
            await message.send(`*WhatsApp presence status is already set to paused.*`);
        } else {
            await settingsDB(["wapresence"], { id: global.configId, content: "paused" }, "set");
            await message.send(`*WhatsApp presence status updated to paused*`);
        }
    } else if (text === "off") {
        if (data.wapresence === "false") {
            await message.send(`*WhatsApp presence is already turned off.*`);
        } else {
            await settingsDB(["wapresence"], { id: global.configId, content: "false" }, "set");
            await message.send(`*WhatsApp presence turned off*`);
        }
    } else {
        await message.send(`*Please use Example: ${PREFIX}wapresence unavailable/available/composing/recording/paused/off*`);
    }
});

Alpha({
    pattern: 'areact',
    fromMe: true,
    desc: 'Set the auto reaction behavior',
    react: "🔄",
    type: "settings"
}, async (message, match) => {
    const text = match.trim().toLowerCase();
    let data = await settingsDB(["autoreaction"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (text === "all") {
        if (data.autoreaction === "true") {
            await message.send(`*Bot is already set to automatically react to all messages.*`);
        } else {
            await settingsDB(["autoreaction"], { id: global.configId, content: "true" }, "set");
            await message.send(`*Bot set to automatically react to all messages*`);
        }
    } else if (text === "cmd") {
        if (data.autoreaction === "cmd") {
            await message.send(`*Bot is already set to automatically react to commands.*`);
        } else {
            await settingsDB(["autoreaction"], { id: global.configId, content: "cmd" }, "set");
            await message.send(`*Bot set to automatically react to commands*`);
        }
    } else if (text === "off") {
        if (data.autoreaction === "false") {
            await message.send(`*Auto reaction is already turned off.*`);
        } else {
            await settingsDB(["autoreaction"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Auto reaction turned off*`);
        }
    } else {
        await message.send(`*Please use Example: ${PREFIX}areact all/cmd/off*`);
    }
});

Alpha({
    pattern: 'readmsg',
    fromMe: true,
    desc: 'Set the auto read message behavior',
    react: "📖",
    type: "settings"
}, async (message, match) => {
    const text = match.trim().toLowerCase();
    let data = await settingsDB(["auto_read_msg"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (text === "all") {
        if (data.auto_read_msg === "true") {
            await message.send(`*Bot is already set to automatically read all messages.*`);
        } else {
            await settingsDB(["auto_read_msg"], { id: global.configId, content: "true" }, "set");
            await message.send(`*Bot set to automatically read all messages*`);
        }
    } else if (text === "cmd") {
        if (data.auto_read_msg === "cmd") {
            await message.send(`*Bot is already set to automatically read only commands.*`);
        } else {
            await settingsDB(["auto_read_msg"], { id: global.configId, content: "cmd" }, "set");
            await message.send(`*Bot set to automatically read only commands*`);
        }
    } else if (text === "off") {
        if (data.auto_read_msg === "false") {
            await message.send(`*Auto read is already turned off.*`);
        } else {
            await settingsDB(["auto_read_msg"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Auto read turned off*`);
        }
    } else {
        await message.send(`*Please use Example: ${PREFIX}readmsg all/cmd/off*`);
    }
});

Alpha({
    pattern: 'antidelete',
    fromMe: true,
    desc: 'Set the anti-delete behavior',
    react: "🗑️",
    type: "settings"
}, async (message, match) => {
    const text = match.trim().toLowerCase();
    let data = await settingsDB(["antidelete"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (text === "g") {
        if (data.antidelete === "g") {
            await message.send(`*Bot is already set to send deleted messages to group.*`);
        } else {
            await settingsDB(["antidelete"], { id: global.configId, content: "g" }, "set");
            await message.send(`*Bot set to send deleted messages to group*`);
        }
    } else if (text === "p") {
        if (data.antidelete === "p") {
            await message.send(`*Bot is already set to send deleted messages to PM.*`);
        } else {
            await settingsDB(["antidelete"], { id: global.configId, content: "p" }, "set");
            await message.send(`*Bot set to send deleted messages to PM*`);
        }
    } else if (text.endsWith('@s.whatsapp.net') || text.endsWith('@g.us')) {
        if (data.antidelete === "text") {
            await message.send(`*Bot is already set to send deleted messages to:* ${text}`);
        } else {
            await settingsDB(["antidelete"], { id: global.configId, content: text }, "set");
            await message.send(`*Bot set to send deleted messages to:* ${text}`);
        }
    } else if (text === "off") {
        if (data.antidelete === "false") {
            await message.send(`*Anti-delete is already turned off.*`);
        } else {
            await settingsDB(["antidelete"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Anti-delete turned off*`);
        }
    } else {
        await message.send(`*Please use Example: ${PREFIX}antidelete g/p/jid : 3742...3@s.whatsapp.net/off*`);
    }
});

Alpha({
    pattern: 'disable',
    fromMe: true,
    desc: 'Set the bot disable settings',
    react: "🚫",
    type: "settings"
}, async (message, match) => {
    const text = match.trim().toLowerCase();
    let data = await settingsDB(["disablegrp", "disablepm"], { id: global.configId }, "get");
    if (!data) {
        await message.send(`*Error retrieving settings. Please try again later.*`);
        return;
    }
    if (text === "grp") {
        if (data.disablegrp === "true") {
            await message.send(`*Bot is already disabled for groups and enabled for PMs.*`);
        } else {
            await settingsDB(["disablegrp", "disablepm"], { id: global.configId, content: "true" }, "set");
            await settingsDB(["disablepm"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Bot disabled for groups and enabled for PMs.*`);
        }
    } else if (text === "pm") {
        if (data.disablepm === "true") {
            await message.send(`*Bot is already disabled for PMs and enabled for groups.*`);
        } else {
            await settingsDB(["disablepm", "disablegrp"], { id: global.configId, content: "true" }, "set");
            await settingsDB(["disablegrp"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Bot disabled for PMs and enabled for groups.*`);
        }
    } else if (text === "off") {
        if (data.disablegrp === "false" && data.disablepm === "false") {
            await message.send(`*Bot is already enabled for all chats.*`);
        } else {
            await settingsDB(["disablegrp", "disablepm"], { id: global.configId, content: "false" }, "set");
            await message.send(`*Bot enabled for all chats.*`);
        }
    } else {
        await message.send(`*Please use Example: ${PREFIX}disable grp/pm/off*`);
    }
});
