import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {api} from './routes.js';
import {config,configurationSummary} from './config.js';
import {databaseHealth,pool} from './db.js';

const app=express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({origin:config.corsOrigin,credentials:true}));
app.use(express.json({limit:'1mb'}));
app.use((req,res,next)=>{res.setHeader('x-request-id',crypto.randomUUID());next();});
app.get('/api/health',async(req,res)=>{try{res.json({status:'ok',service:'securevision-api',...configurationSummary(),database:await databaseHealth()});}catch(error){res.status(503).json({status:'degraded',error:'Database unavailable'});}});
app.use('/api',api);
app.use((req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'Endpoint not found.'}}));
app.use((error,req,res,next)=>{
  const requestId=res.getHeader('x-request-id');
  console.error(`[${requestId}]`,error);
  const development=config.nodeEnv!=='production';
  const message=error.status||development?error.message:'An unexpected error occurred.';
  res.status(error.status||500).json({error:{code:error.status===401?'UNAUTHENTICATED':'INTERNAL_ERROR',message,requestId}});
});

const server=app.listen(config.port,'127.0.0.1',()=>console.log(`SecureVision API running at http://127.0.0.1:${config.port}`));
async function shutdown(){server.close(async()=>{if(pool)await pool.end();process.exit(0);});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
