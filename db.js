import pg from 'pg';
import {mkdirSync} from 'node:fs';
let pool,local;
if(process.env.DATABASE_URL){pool=new pg.Pool({connectionString:process.env.DATABASE_URL});}
else {if(process.env.NODE_ENV==='production') throw Error('DATABASE_URL obrigatório em produção'); mkdirSync('.data',{recursive:true}); const {DatabaseSync}=await import('node:sqlite');local=new DatabaseSync(process.env.SQLITE_PATH||'.data/dev.sqlite');}
export async function query(sql,args=[]){if(pool)return pool.query(sql,args); const s=local.prepare(sql.replace(/\$\d+/g,'?')); if(/^\s*(SELECT|WITH)/i.test(sql)||/\bRETURNING\b/i.test(sql))return {rows:s.all(...args)}; s.run(...args);return {rows:[]};}
export async function init(){for(const sql of [
'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL)',
'CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires BIGINT NOT NULL)',
'CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, token TEXT UNIQUE NOT NULL, status TEXT NOT NULL, payload TEXT NOT NULL, response TEXT, created TEXT NOT NULL)',
'CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, created TEXT NOT NULL)',
'CREATE TABLE IF NOT EXISTS interactions (id TEXT PRIMARY KEY, appointment_id TEXT NOT NULL, payload TEXT NOT NULL, created TEXT NOT NULL)'])await query(sql);}
export async function close(){if(pool)await pool.end();else local.close();}
