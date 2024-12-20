export default {
  apps: [
    {
      name: 'iframe-monitor',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
    },
    {
      name: 'cron-monitor',
      script: 'src/monitor.js',
      instances: 1,
      cron_restart: '*/30 * * * *', // every 30 minutes
      autorestart: false, // no need for automatic restart
    },
  ],
}
