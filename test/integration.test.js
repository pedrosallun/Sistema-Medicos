import {test,after} from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtempSync,rmSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {randomBytes} from 'node:crypto';
const dir=mkdtempSync(join(tmpdir(),'elo-test-')),password=randomBytes(20).toString('hex'),port=3219;
const child=spawn(process.execPath,['server.js'],{env:{...process.env,NODE_ENV:'test',PORT:String(port),SQLITE_PATH:join(dir,'db.sqlite'),DATA_ENCRYPTION_KEY:randomBytes(32).toString('hex'),ADMIN_EMAIL:'admin@example.test',ADMIN_PASSWORD:password},stdio:['ignore','pipe','pipe']});
let logs='';child.stderr.on('data',x=>logs+=x);const base=`http://127.0.0.1:${port}/api`;let cookie;
async function call(path,method='GET',body,auth=true){return fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(auth&&cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});}
after(()=>{child.kill();rmSync(dir,{recursive:true,force:true});});
test('fluxo de pré-consulta, permissões, privacidade e auditoria',async()=>{
 for(let i=0;i<80;i++){try{if((await call('/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));if(i===79)throw Error(logs);}
 assert.equal((await call('/appointments')).status,401);
 let r=await call('/login','POST',{email:'admin@example.test',password});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/);
 assert.equal((await call('/appointments','POST',{name:'Incompleto'})).status,400);
 r=await call('/appointments','POST',{name:'Paciente Teste Seguro',birth:'1990-01-10',phone:'11999999999',email:'patient@example.test',date:'2026-12-01',time:'14:30',doctor:'Dra. Raíssa'});assert.equal(r.status,201);const {id,path}=await r.json(),token=path.split('/').at(-1);
 r=await call('/questionnaire/'+token,'GET',null,false);assert.equal(r.status,200);const publicData=await r.json();assert.equal(publicData.name,'Paciente');assert.equal(publicData.questions.length,8);assert.equal(publicData.phone,undefined);
 const body={reason:'Dor no joelho',region:'Joelho',duration:'3 meses',pain:6,treatment:'Fisioterapia',activity:'Corrida',frequency:3,limitations:'Correr',goal:'Voltar a correr',concerns:'Sentir dor',success:'Correr sem dor',event:'Meia maratona',eventDate:'2026-12-15',answers:[2,2,2,2,3,3,0,1],privacy:true,contact:false};
 assert.equal((await call('/questionnaire/'+token,'POST',{...body,privacy:false},false)).status,400);
 assert.equal((await call('/questionnaire/'+token,'POST',body,false)).status,200);
 assert.equal((await call('/questionnaire/'+token,'POST',body,false)).status,404);
 r=await call('/appointments/'+id);const detail=await r.json();assert.equal(detail.response.profile.primary[0],'verde');assert.match(detail.response.summary,/6\/10/);assert.equal(detail.response.contact,false);
 assert.equal((await call(`/appointments/${id}/interactions`,'POST',{note:'Paciente orientado a conversar com equipe.'})).status,201);
 assert.equal((await (await call('/appointments/'+id)).json()).interactions.length,1);
 r=await call('/audit');const auditLogs=await r.json();assert.ok(auditLogs.some(x=>x.action==='read_clinical_record'));assert.ok(auditLogs.some(x=>x.action==='complete_questionnaire'));
 assert.equal((await call('/users','POST',{name:'Recepção',email:'staff@example.test',password,role:'staff'})).status,201);
 r=await call('/login','POST',{email:'staff@example.test',password});cookie=r.headers.get('set-cookie').split(';')[0];
 assert.equal((await call('/appointments/'+id)).status,403);assert.equal((await call('/audit')).status,403);assert.equal((await call('/users')).status,403);
 assert.equal((await (await call('/appointments')).json())[0].response,undefined);
 let raw;if(process.env.DATABASE_URL){const {default:pg}=await import('pg');const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});raw=Buffer.from(JSON.stringify((await pool.query('SELECT payload,response FROM appointments')).rows));await pool.end();}else raw=readFileSync(join(dir,'db.sqlite'));assert.equal(raw.includes(Buffer.from('Paciente Teste Seguro')),false);assert.equal(raw.includes(Buffer.from('Dor no joelho')),false);
 assert.equal((await fetch(base+'/appointments',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json',Origin:'https://hostile.test'},body:'{}'})).status,403);
 await call('/logout','POST',{});assert.equal((await call('/me')).status,401);
 r=await call('/login','POST',{email:'admin@example.test',password});cookie=r.headers.get('set-cookie').split(';')[0];assert.equal((await call('/appointments/'+id,'DELETE')).status,415); // mutations require JSON
 assert.equal((await call('/appointments/'+id,'DELETE',{})).status,200);assert.equal((await call('/appointments/'+id)).status,404);
});
