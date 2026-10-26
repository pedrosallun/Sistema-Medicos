import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateAI,canGenerateAI,DEFAULT_AI_MODEL} from '../ai.js';
const response={name:'Identificador não enviado',email:'secret@example.test',birth:'1990-01-01',reason:'Dor no joelho',contact:false,profile:{guidance:'Acolher dúvidas.'}};
const output={summary:'Relato de dor no joelho.',communication:'Acolher dúvidas.',opportunity:'Conversar em consulta.'};
const providerResponse=(input=output)=>({ok:true,json:async()=>({stop_reason:'tool_use',content:[{type:'tool_use',name:'preconsultation',input}]})});
test('Claude recebe o protocolo correto, contexto mínimo e saída estruturada',async()=>{
 let sent,headers;
 const result=await generateAI(response,{apiKey:'test-only',fetcher:async(url,opts)=>{assert.equal(url,'https://api.anthropic.com/v1/messages');sent=JSON.parse(opts.body);headers=opts.headers;return providerResponse();}});
 assert.deepEqual(result,output);assert.equal(headers['x-api-key'],'test-only');assert.equal(headers['anthropic-version'],'2023-06-01');assert.equal(headers.Authorization,undefined);assert.equal(sent.model,DEFAULT_AI_MODEL);assert.equal(sent.tool_choice.name,'preconsultation');assert.ok(!JSON.stringify(sent).includes('secret@example.test'));assert.ok(!JSON.stringify(sent).includes('Identificador não enviado'));
});
test('falha do fornecedor é explicitamente propagada',async()=>{await assert.rejects(()=>generateAI(response,{apiKey:'test-only',fetcher:async()=>({ok:false})}),/AI_PROVIDER_UNAVAILABLE/);});
test('recusa resposta truncada, ferramenta errada e estrutura inválida',async()=>{
 for(const data of [{stop_reason:'max_tokens',content:[]},{stop_reason:'tool_use',content:[{type:'tool_use',name:'other',input:output}]},{stop_reason:'tool_use',content:[{type:'tool_use',name:'preconsultation',input:{summary:'Sem os campos exigidos'}}]}]){
  await assert.rejects(()=>generateAI(response,{apiKey:'test-only',fetcher:async()=>({ok:true,json:async()=>data})}));
 }
});
test('aviso antigo ou de outro provedor não autoriza Claude',()=>{
 assert.equal(canGenerateAI({aiDisclosure:true},true),false);
 assert.equal(canGenerateAI({aiDisclosure:true,aiDisclosureProvider:'openai'},true),false);
 assert.equal(canGenerateAI({aiDisclosure:true,aiDisclosureProvider:'anthropic'},false),false);
 assert.equal(canGenerateAI({aiDisclosure:true,aiDisclosureProvider:'anthropic'},true),true);
});
