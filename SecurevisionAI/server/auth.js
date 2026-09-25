import {applicationDefault,cert,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {config} from './config.js';
import {pool} from './db.js';

function firebaseApp(){
  if(getApps().length) return getApps()[0];
  const json=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  return initializeApp({credential:json?cert(JSON.parse(json)):applicationDefault()});
}

export async function authenticate(req,res,next){
  try{
    if(config.authBypass){
      req.user={uid:'local-admin',email:'admin@securevision.local',role:req.header('x-dev-role')||'admin'};
      return next();
    }
    const header=req.header('authorization')||'';
    if(!header.startsWith('Bearer ')) return res.status(401).json({error:{code:'UNAUTHENTICATED',message:'A Firebase bearer token is required.'}});
    const decoded=await getAuth(firebaseApp()).verifyIdToken(header.slice(7));
    if(!decoded.email) return res.status(401).json({error:{code:'EMAIL_REQUIRED',message:'The Firebase account must have an email address.'}});
    req.user=await resolveApplicationUser(decoded);
    next();
  }catch(error){next(Object.assign(new Error(error.status===403?error.message:'Authentication failed.'),{status:error.status||401,cause:error}));}
}

async function resolveApplicationUser(decoded){
  const fallback={uid:decoded.uid,email:decoded.email,fullName:decoded.name||decoded.email.split('@')[0],role:decoded.role||'customer'};
  if(!pool)return fallback;
  const client=await pool.connect();
  try{
    await client.query('begin');
    await client.query('select pg_advisory_xact_lock($1)',[743219]);
    let result=await client.query('select firebase_uid,email,full_name,role,company_id,customer_id,is_active from app_users where firebase_uid=$1',[decoded.uid]);
    if(!result.rowCount){
      const count=await client.query('select count(*)::int total from app_users');
      if(count.rows[0].total===0){
        result=await client.query('insert into app_users(firebase_uid,email,full_name,role) values($1,$2,$3,$4) returning firebase_uid,email,full_name,role,company_id,customer_id,is_active',[decoded.uid,decoded.email,fallback.fullName,'admin']);
      }else{
        const invitation=await client.query(`select * from team_invitations where lower(email)=lower($1) and status='Pending' and expires_at>now() order by created_at desc limit 1`,[decoded.email]);
        if(!invitation.rowCount)throw Object.assign(new Error('Your account needs an invitation from a company administrator.'),{status:403});
        const invite=invitation.rows[0];
        result=await client.query('insert into app_users(firebase_uid,email,full_name,role,company_id,customer_id) values($1,$2,$3,$4,$5,$6) returning firebase_uid,email,full_name,role,company_id,customer_id,is_active',[decoded.uid,decoded.email,decoded.name||invite.full_name||fallback.fullName,invite.role,invite.company_id,invite.customer_id]);
        await client.query(`update team_invitations set status='Accepted',accepted_at=now() where id=$1`,[invite.id]);
      }
    }else if(result.rows[0].email!==decoded.email||result.rows[0].full_name!==fallback.fullName){
      result=await client.query('update app_users set email=$2,full_name=$3,updated_at=now() where firebase_uid=$1 returning firebase_uid,email,full_name,role,company_id,customer_id,is_active',[decoded.uid,decoded.email,fallback.fullName]);
    }
    if(!result.rows[0].is_active)throw Object.assign(new Error('This company account has been deactivated.'),{status:403});
    if(result.rows[0].role==='engineer'&&result.rows[0].company_id){
      const profile=await client.query(`update engineer_profiles set user_uid=$1,status=case when status='Invited' then 'Available' else status end,updated_at=now() where company_id=$2 and lower(email)=lower($3) returning id`,[decoded.uid,result.rows[0].company_id,decoded.email]);
      if(profile.rowCount)await client.query(`update jobs set assigned_engineer_uid=$1,updated_at=now() where company_id=$2 and engineer_profile_id=$3 and assigned_engineer_uid is distinct from $1`,[decoded.uid,result.rows[0].company_id,profile.rows[0].id]);
    }
    await client.query('commit');
    const row=result.rows[0];
    return {uid:row.firebase_uid,email:row.email,fullName:row.full_name,role:row.role,companyId:row.company_id,customerId:row.customer_id,isActive:row.is_active};
  }catch(error){await client.query('rollback');throw error;}finally{client.release();}
}

export const allowRoles=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({error:{code:'FORBIDDEN',message:'You do not have permission to perform this action.'}});
