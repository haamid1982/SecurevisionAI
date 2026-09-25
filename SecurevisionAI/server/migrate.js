import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {pool} from './db.js';

if(!pool){
  console.error('DATABASE_URL is missing. Add the pooled Neon connection string to .env first.');
  process.exit(1);
}

const here=dirname(fileURLToPath(import.meta.url));
const client=await pool.connect();

try{
  await client.query('begin');
  await client.query('create table if not exists schema_migrations(name text primary key,applied_at timestamptz not null default now())');
  const directory=join(here,'migrations');
  const files=(await readdir(directory)).filter(name=>name.endsWith('.sql')).sort();
  for(const name of files){
    const applied=await client.query('select 1 from schema_migrations where name=$1',[name]);
    if(applied.rowCount)continue;
    const migration=await readFile(join(directory,name),'utf8');
    await client.query(migration);
    await client.query('insert into schema_migrations(name) values($1)',[name]);
    console.log(`Applied migration ${name}`);
  }
  await client.query('commit');
  console.log('SecureVision AI database migration completed successfully.');
}catch(error){
  await client.query('rollback');
  console.error('Migration failed:',error.message);
  process.exitCode=1;
}finally{
  client.release();
  await pool.end();
}
