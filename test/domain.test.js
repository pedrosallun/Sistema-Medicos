import {test} from 'node:test';import assert from 'node:assert/strict';import {profile,summary} from '../domain.js';
test('perfil predominante e secundário',()=>{const r=profile([0,0,0,0,1,1,2,3]);assert.deepEqual(r.primary,['vermelho']);assert.deepEqual(r.secondary,['amarelo']);assert.equal(r.scores.vermelho,4);assert.equal(r.mixed,false);});
test('empate apresenta todas as cores empatadas',()=>{const r=profile([0,0,1,1,2,2,3,3]);assert.equal(r.mixed,true);assert.equal(r.primary.length,4);assert.deepEqual(r.secondary,[]);});
test('empate secundário e perfil único',()=>{assert.deepEqual(profile([0,0,0,0,1,1,2,2]).secondary,['amarelo','verde']);assert.deepEqual(profile(Array(8).fill(3)).secondary,[]);});
test('rejeita pontuação inválida',()=>{assert.throws(()=>profile([0]));assert.throws(()=>profile(Array(8).fill(4)));});
test('resumo preserva relato e não prescreve',()=>{const r=summary({reason:'Dor no joelho',region:'joelho',duration:'3 meses',pain:6,frequency:3,goal:'Voltar a correr'});assert.match(r,/Relato do paciente: Dor no joelho/);assert.match(r,/6\/10/);assert.match(r,/Voltar a correr/);});
