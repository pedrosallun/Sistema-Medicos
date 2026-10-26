export const colors = ['vermelho','amarelo','verde','azul'];
export const guidance = {vermelho:'Seja objetivo: apresente opções, resultados esperados e próximos passos.',amarelo:'Crie proximidade, escute suas histórias e use exemplos concretos.',verde:'Acolha dúvidas, explique as etapas com tranquilidade e respeite o tempo de decisão.',azul:'Organize as informações, explique os motivos e apresente evidências e alternativas.'};
export const questions = [
['Ao conhecer um profissional, você prefere…','Ir direto ao assunto','Conversar e criar conexão','Sentir acolhimento e calma','Entender sua experiência e método'],
['Para tomar uma decisão, ajuda mais…','Saber o próximo passo','Trocar ideias em uma conversa','Ter tempo e segurança','Comparar informações detalhadas'],
['Ao receber orientações, você gosta de…','Uma lista curta de ações','Exemplos e histórias','Uma explicação tranquila','Instruções completas por escrito'],
['Se surge uma mudança de planos, você…','Busca uma solução rápida','Conversa sobre possibilidades','Prefere reorganizar com calma','Quer entender os motivos'],
['Na consulta, o que mais valoriza?','Clareza sobre os objetivos','Uma relação próxima','Escuta sem pressa','Explicações bem fundamentadas'],
['Quando tem dúvidas, prefere…','Respostas diretas','Uma conversa aberta','Poder perguntar com tranquilidade','Detalhes sobre cada alternativa'],
['Para acompanhar seu progresso, prefere…','Metas práticas','Conversar sobre as conquistas','Uma rotina previsível','Registros e comparações'],
['Ao planejar os próximos passos, prefere…','Definir prioridades logo','Explorar possibilidades juntos','Avançar no seu ritmo','Avaliar vantagens e limites']
];
export function profile(answers){
 if(answers.length!==questions.length || answers.some(x=>!Number.isInteger(x)||x<0||x>3)) throw Error('Respostas comportamentais inválidas');
 const scores=Object.fromEntries(colors.map(c=>[c,0])); answers.forEach(i=>scores[colors[i]]++);
 const ranked=[...colors].sort((a,b)=>scores[b]-scores[a]);
 const primary=ranked.filter(c=>scores[c]===scores[ranked[0]]);
 const remaining=ranked.filter(c=>!primary.includes(c));
 const secondary=remaining.filter(c=>scores[c]>0 && scores[c]===scores[remaining[0]]);
 return {scores,primary,secondary,mixed:primary.length>1,guidance:primary.map(c=>guidance[c]).join(' ')};
}
export function summary(r){return `Relato do paciente: ${r.reason}. Região: ${r.region}. Sintomas há ${r.duration}; dor informada ${r.pain}/10. Tratamentos informados: ${r.treatment || 'não informado'}. Atividade física: ${r.activity || 'não informada'} (${r.frequency} vezes/semana). Limitações: ${r.limitations || 'não informadas'}. Objetivo: ${r.goal}. Preocupações: ${r.concerns || 'não informadas'}. Critério de sucesso: ${r.success || 'não informado'}.`;}
