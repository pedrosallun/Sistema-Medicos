import bcrypt from 'bcryptjs';
import {randomUUID,randomBytes} from 'node:crypto';
import {query} from './db.js';
import {profile,summary} from './domain.js';

// Exclusivo da instância pública de demonstração. Os dados vivem apenas na memória.
export async function seedDemo(encrypt,hash) {
  const admin=randomUUID();
  await query('INSERT INTO users VALUES ($1,$2,$3,$4,$5)',[admin,'teste@gmail.com','Equipe de demonstração',await bcrypt.hash('teste123',12),'admin']);
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
  const day=n=>new Date(new Date(today+'T12:00:00Z').getTime()+n*86400000).toISOString().slice(0,10);
  const examples=[
    ['Mariana Oliveira','Joelho esquerdo','Corrida','Voltar a correr sem dor','Meia maratona',6,[2,2,2,2,3,3,0,1],true],
    ['Rafael Costa','Ombro direito','Musculação','Retomar os treinos','Campeonato amador',4,[0,0,0,0,3,3,2,1],true],
    ['Ana Beatriz Santos','Lombar','Caminhada','Caminhar com a família','Viagem em família',5,[3,3,3,3,2,2,0,1],false],
    ['Lucas Ferreira','Tornozelo','Futebol','Voltar a jogar aos domingos','Torneio da comunidade',3,[1,1,1,1,0,0,2,3],true],
    ['Camila Rodrigues','Quadril','Pilates','Retomar minha rotina','Trilha com amigos',7,[0,0,1,1,2,2,3,3],false],
    ['Bruno Almeida','Punho','Tênis','Praticar tênis sem desconforto','',2,[2,2,2,3,3,1,1,0],true],
    ['Juliana Pereira','Cervical','Natação','Dormir melhor e voltar a nadar','',4,[3,3,3,3,3,2,2,1],false],
    ['Felipe Martins','Joelho','Ciclismo','Retomar o pedal','Passeio de bicicleta',3,[0,0,0,0,1,1,2,3],true],
  ];
  for(const [i,x] of examples.entries()) {
    const [name,region,activity,goal,event,pain,answers,contact]=x;
    const id=randomUUID(),created=new Date().toISOString(),pending=i>=6;
    const appointment={name,birth:`${1985+i}-06-15`,phone:`1190000000${i}`,email:`paciente${i+1}@example.test`,date:day(i<5?0:1),time:['09:00','09:30','10:30','11:00','14:00','14:30','15:00','16:00'][i],doctor:i%2?'Dra. Raíssa':'Dr. Glauber'};
    const response={reason:`Desconforto em ${region.toLowerCase()} durante ${activity.toLowerCase()}.`,region,duration:'3 meses',pain,treatment:'Fisioterapia informada pelo paciente',activity,frequency:3,limitations:`Dificuldade para praticar ${activity.toLowerCase()}`,goal,concerns:'Receio de não conseguir retomar minha atividade',success:'Retomar a rotina com conforto',event,eventDate:event?day(14+i*5):'',answers,privacy:true,contact,completed:created,summarySource:'structured',questionnaireVersion:'demo-ficticio',aiDisclosure:false,aiDisclosureProvider:null};
    response.profile=profile(answers);response.summary=summary(response);
    await query('INSERT INTO appointments VALUES ($1,$2,$3,$4,$5,$6)',[id,hash(randomBytes(32).toString('hex')),pending?'pending':'completed',encrypt(appointment),pending?null:encrypt(response),created]);
    if(i<3)await query('INSERT INTO interactions VALUES ($1,$2,$3,$4)',[randomUUID(),id,encrypt({note:'Exemplo fictício: equipe revisou o objetivo informado para preparar a consulta.',author:'Equipe de demonstração'}),created]);
  }
  await query('INSERT INTO audit_logs VALUES ($1,$2,$3,$4,$5)',[randomUUID(),admin,'seed_demo','dados-ficticios',new Date().toISOString()]);
}
