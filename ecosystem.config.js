module.exports = {
  apps: [
    {
      name: 'API',
      script: 'npm start',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: '111.231.99.206',
      ref: 'origin/master',
      repo: 'https://github.com/mosaice/socket-server.git',
      path: '/data/www/ws.mosaice.cn',
      'post-deploy':
        'npm install && export NODE_ENV=production && export PORT=4000 && pm2 reload ecosystem.config.js --env production'
    }
  }
};
