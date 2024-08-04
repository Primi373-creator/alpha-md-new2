const { Alpha, mode, lang, groupDB, config, isAdmin, isBotAdmin,PREFIX } = require('../lib');

Alpha({
    pattern: 'amute',
    fromMe: mode,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "group"
}, async (message, match) => {
    match = match || message.reply_message.text;
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;
    
    let muteTime = match.split(':');
    if (muteTime.length !== 2 || isNaN(muteTime[0]) || isNaN(muteTime[1]) || muteTime[0] > 23 || muteTime[1] > 59) {
        return message.send(`Please provide the mute time.\nEg: ${PREFIX}amute 22:00`);
    }

    // Update groupDB with mute time
    await groupDB(
        ["mute"],
        { jid: message.jid, content: match },
        "set"
    );

    return message.send(`Mute time set to ${match} for this group.`);
});

Alpha({
    pattern: 'aunmute',
    fromMe: mode,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "group"
}, async (message, match) => {
    match = match || message.reply_message.text;
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;

    let unmuteTime = match.split(':');
    if (unmuteTime.length !== 2 || isNaN(unmuteTime[0]) || isNaN(unmuteTime[1]) || unmuteTime[0] > 23 || unmuteTime[1] > 59) {
        return message.send(`Please provide the unmute time.\nEg: ${PREFIX}aunmute 22:00`);
    }

    // Update groupDB with unmute time
    await groupDB(
        ["unmute"],
        { jid: message.jid, content: match },
        "set"
    );

    return message.send(`Unmute time set to ${match} for this group.`);
});

Alpha({
    pattern: 'damute',
    fromMe: mode,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "group"
}, async (message) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;

    // Remove mute time from groupDB
    await groupDB(
        ["mute"],
        { jid: message.jid, content: null },
        "delete"
    );

    return message.send("Mute time removed for this group.");
});

Alpha({
    pattern: 'daunmute',
    fromMe: mode,
    desc: lang.SCRAP.RING_DESC,
    react: "🙃",
    type: "group"
}, async (message) => {
    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
    if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
    if (!admin && !message.isCreator) return;

    // Remove unmute time from groupDB
    await groupDB(
        ["unmute"],
        { jid: message.jid, content: null },
        "delete"
    );

    return message.send("Unmute time removed for this group.");
});
