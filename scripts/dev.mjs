import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
if(process.env.NODE_ENV==='production')throw Error('Este helper é exclusivo de desenvolvimento');
mkdirSync('.data',{recursive:true});
if(!existsSync('.data/dev-access.json'))writeFileSync('.data/dev-access.json',JSON.stringify({email:'admin@elo.local',password:randomBytes(20).toString('base64url')}),{mode:0o600});
const c=JSON.parse(readFileSync('.data/dev-access.json','utf8'));
process.env.ADMIN_EMAIL ||= c.email;process.env.ADMIN_PASSWORD ||= c.password;
console.log('Acesso local guardado em .data/dev-access.json (arquivo ignorado pelo Git).');
await import('../server.js');
