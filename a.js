const clc = require('cli-color'); // Ensure you have this module installed















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