module.exports = {
  apps: [{
    name: 'webagent-backend',
    script: 'server.js',
    cwd: '/home/webagent/backend',
    instances: 1,
    exec_mode: 'fork',
    env_file: '/home/webagent/backend/.env',
    watch: false,
    autorestart: true,
    max_memory_restart: '1G',
    error_file: '/home/webagent/logs/pm2-error.log',
    out_file: '/home/webagent/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};

