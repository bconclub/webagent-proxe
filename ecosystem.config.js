module.exports = {
  apps: [{
    name: 'webagent-backend',
    script: './backend/server.js',
    cwd: '/home/webagent',
    instances: 1,
    exec_mode: 'fork',
    env_file: './backend/.env',
    watch: false,
    autorestart: true,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};

