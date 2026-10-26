import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./browser',workers:1,
  use:{baseURL:'http://127.0.0.1:3220',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},
  webServer:[
    {command:'node test/browser-server.js',url:'http://127.0.0.1:3220/api/health',reuseExistingServer:false},
    {command:'node server.js',env:{DEMO_MODE:'true',PORT:'3223',NODE_ENV:'production'},url:'http://127.0.0.1:3223/api/health',reuseExistingServer:false},
  ],
});
