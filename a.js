const clc = require('cli-color'); // Ensure you have this module installed

console.log(clc.yellow("💾 Syncing Database"));
await config.DATABASE.sync();
const syncSettings = async () => {
  try {
    global.configId = `kiyoshi_${config.SUDO.split(',')[0]}@s.whatsapp.net`;
    let existingSettings = await settingsDB(
      [
        'alwaysonline', 'anticall', 'antidelete', 'auto_read_msg', 'auto_read_status', 
        'auto_save_status', 'autobio', 'autoreaction', 'disablegrp', 'worktype', 
        'disablepm', 'tempsudo', 'wapresence'
      ],
      { id: global.configId },
      'get'
    );
    if (!existingSettings) {
      console.log(clc.red(`No configuration found for ${global.configId}. Creating a new settings record.`));
      const defaultSettings = {
        alwaysonline: "false", anticall: "reject", antidelete: "false", auto_read_msg: "cmd", 
        auto_read_status: "true", auto_save_status: "false", autobio: "false", autoreaction: "true", 
        disablegrp: "false", worktype: "private", disablepm: "false", tempsudo: "", wapresence: "false"
      };
      await Promise.all(
        Object.keys(defaultSettings).map(async (key) => {
          await settingsDB([key], { id: global.configId, content: defaultSettings[key] }, 'set');
        })
      );
      existingSettings = await settingsDB(
        [
          'alwaysonline', 'anticall', 'antidelete', 'auto_read_msg', 'auto_read_status', 
          'auto_save_status', 'autobio', 'autoreaction', 'disablegrp', 'worktype', 
          'disablepm', 'tempsudo', 'wapresence'
        ],
        { id: global.configId },
        'get'
      );
    }

    global.pers_db = existingSettings;
    console.log(clc.green(`Settings synchronized for ${global.configId}`));
  } catch (error) {
    console.error(clc.red("Could not connect with the database.\nError:"), clc.red(error.message));
    process.exit(1);
  }
};

syncSettings();















async function autobio() {
    if (pers_db.autobio === "true") {
        async function updateStatus() {
            const time = moment().tz(config.TZ).format('HH:mm');
            const date = moment().tz(config.TZ).format('DD/MM/YYYY');
            const status = `⏰Time: ${time}\n📅Date: ${date}\n🚀alpha-md`;
            await Void.updateProfileStatus(status);
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