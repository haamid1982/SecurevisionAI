import pg from 'pg';
import {config} from './config.js';

const {Pool}=pg;
export const pool=config.databaseUrl?new Pool({connectionString:config.databaseUrl}):null;

export async function query(text,params=[]){
  if(!pool) throw new Error('DATABASE_URL is not configured');
  return pool.query(text,params);
}

export async function databaseHealth(){
  if(!pool) return {connected:false,mode:'memory'};
  const result=await query('select now() as now');
  return {connected:true,mode:'postgresql',serverTime:result.rows[0].now};
}
