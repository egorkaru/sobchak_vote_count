const { CronJob } = require('cron');
const { scrape } = require('./scraper')

const sobchakJob = new CronJob('0 */5 * * * *', function() {
    scrape()
});
sobchakJob.start()
