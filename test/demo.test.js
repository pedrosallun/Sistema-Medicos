import {test,after} from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
let child;
after(()=>child?.kill());
test('demo tem login solicitado e dados fictícios, sem conectar ao banco clínico ou IA',async()=>{
 child=spawn(process.execPath,['server.js'],{env:{...process.env,NODE_ENV:'production',PORT:'3222',DEMO_MODE:'true',DATABASE_URL:'postgresql://invalid.example/never-connect',ENABLE_AI:'true',ANTHROPIC_API_KEY:'test-only-do-not-send'},stdio:['ignore','pipe','pipe']});
 let logs='';child.stderr.on('data',x=>logs+=x);const base='http://127.0.0.1:3222/api';
 for(let i=0;i<80;i++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));if(i===79)throw Error(logs);}
 assert.equal((await (await fetch(base+'/config')).json()).demo,true);
 const login=await fetch(base+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'teste@gmail.com',password:'teste123'})});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0],headers={Cookie:cookie,'Content-Type':'application/json'};
 const list=await (await fetch(base+'/appointments',{headers})).json();assert.equal(list.length,8);assert.equal(list.filter(a=>a.status==='completed').length,6);assert.ok(list.some(a=>a.response?.profile.mixed));assert.ok(list.some(a=>a.response?.event));
 const detail=await (await fetch(base+'/appointments/'+list[0].id,{headers})).json();assert.equal(detail.aiEnabled,false);assert.ok(detail.interactions.length);
 assert.equal((await fetch(base+'/appointments/'+list[0].id+'/ai-summary',{method:'POST',headers,body:'{}'})).status,503);
 assert.equal((await fetch(base+'/appointments')).status,401);
});
