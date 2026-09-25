import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Link,NavLink,useNavigate,useParams} from 'react-router-dom';
import * as I from 'lucide-react';
import {api} from './api.js';
import {logoutFirebase} from './firebase-client.js';
import './app-styles.css';
import './engineer-styles.css';

const engineerMenu=[
  ['/engineer','LayoutDashboard','Dashboard'],
  ['/engineer/jobs','BriefcaseBusiness','My Jobs'],
  ['/engineer/schedule','CalendarDays','My Schedule'],
];

const initials=name=>String(name||'Engineer').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
const date=value=>value?new Date(value).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'Not set';
const time=value=>value?new Date(value).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'Time TBC';
const tone=value=>value==='Completed'?'green':value==='In Progress'?'blue':value==='Urgent'?'red':value==='High'?'amber':'grey';

function EngineerShell({children,title,subtitle,action}){
  const [mobile,setMobile]=useState(false),[user,setUser]=useState(null);
  const navigate=useNavigate();
  useEffect(()=>{api.me().then(x=>setUser(x.user)).catch(()=>{})},[]);
  const logout=async()=>{await logoutFirebase();navigate('/login',{replace:true})};
  return <div className="app-shell engineer-shell">
    <aside className={mobile?'app-side open':'app-side'}>
      <Link className="app-logo" to="/engineer"><img src="/assets/logo.png" alt="SecureVision AI"/></Link>
      <div className="engineer-portal-label"><I.HardHat/> Engineer portal</div>
      <nav>{engineerMenu.map(([to,icon,label])=>{const Icon=I[icon];return <NavLink key={to} end={to==='/engineer'} to={to} onClick={()=>setMobile(false)}><Icon/><span>{label}</span></NavLink>})}</nav>
      <div className="app-help"><I.ShieldCheck/><b>Secure workspace</b><small>You can only access jobs assigned to you.</small></div>
      <button className="engineer-logout" onClick={logout}><I.LogOut/>Sign out</button>
      <div className="app-user"><div className="avatar">{initials(user?.fullName)}</div><span><b>{user?.fullName||'Engineer'}</b><small>Engineer</small></span></div>
    </aside>
    <div className="app-main">
      <header className="app-top"><button className="app-menu" onClick={()=>setMobile(!mobile)} aria-label="Open engineer menu"><I.Menu/></button><div className="engineer-top-title"><I.HardHat/> Field workspace</div><button className="round" onClick={logout} aria-label="Sign out"><I.LogOut/></button><div className="top-avatar">{initials(user?.fullName)}</div></header>
      <main className="app-content"><div className="app-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>{children}</main>
    </div>
  </div>;
}

function Loading({message='Loading your assigned work…'}){return <div className="engineer-empty"><I.LoaderCircle className="spin"/><p>{message}</p></div>}
function Status({children}){return <span className={'app-badge '+tone(children)}>{children}</span>}

export function EngineerDashboard(){
  const [jobs,setJobs]=useState(null),[error,setError]=useState('');
  useEffect(()=>{api.jobs.list().then(setJobs).catch(e=>setError(e.message))},[]);
  if(!jobs)return <EngineerShell title="Engineer Dashboard" subtitle="Your assigned work, schedule and progress.">{error?<div className="connection-note">{error}</div>:<Loading/>}</EngineerShell>;
  const today=new Date().toDateString();
  const todays=jobs.filter(j=>j.scheduledStart&&new Date(j.scheduledStart).toDateString()===today);
  const active=jobs.filter(j=>!['Completed','Cancelled'].includes(j.status));
  return <EngineerShell title="Engineer Dashboard" subtitle="Everything you need for today’s field work." action={<Link className="app-button" to="/engineer/jobs"><I.BriefcaseBusiness/>View My Jobs</Link>}>
    <div className="metric-grid engineer-metrics">
      {[[I.CalendarCheck,'Today',todays.length,'Scheduled today'],[I.BriefcaseBusiness,'Active jobs',active.length,'Assigned to you'],[I.LoaderCircle,'In progress',jobs.filter(j=>j.status==='In Progress').length,'Currently underway'],[I.CircleCheckBig,'Completed',jobs.filter(j=>j.status==='Completed').length,'All assigned jobs']].map(([Icon,label,value,small])=><article className="metric-card" key={label}><div className="metric-icon red"><Icon/></div><span><small>{label}</small><strong>{value}</strong><em>{small}</em></span></article>)}
    </div>
    <section className="app-panel engineer-today"><header><h2><I.CalendarDays/> Today’s schedule</h2><Link to="/engineer/schedule">Full schedule</Link></header>
      {(todays.length?todays:active.slice(0,4)).map(job=><JobCard key={job.id} job={job}/>)}
      {!active.length&&<div className="engineer-empty"><I.CircleCheckBig/><h3>You’re all caught up</h3><p>No active jobs are currently assigned to you.</p></div>}
    </section>
  </EngineerShell>;
}

function JobCard({job}){
  return <Link className="engineer-job-card" to={`/engineer/jobs/${job.id}`}>
    <div className="engineer-job-time"><b>{time(job.scheduledStart)}</b><small>{date(job.scheduledStart||job.dueDate)}</small></div>
    <span><small>{job.reference}</small><b>{job.title}</b><p><I.Building2/> {job.customerName} {job.siteName&&`· ${job.siteName}`}</p></span>
    <Status>{job.status}</Status><I.ChevronRight/>
  </Link>;
}

export function EngineerJobs(){
  const [jobs,setJobs]=useState(null),[query,setQuery]=useState(''),[error,setError]=useState('');
  useEffect(()=>{api.jobs.list().then(setJobs).catch(e=>setError(e.message))},[]);
  const rows=useMemo(()=>jobs?.filter(j=>[j.reference,j.title,j.customerName,j.siteName,j.status].join(' ').toLowerCase().includes(query.toLowerCase()))||[],[jobs,query]);
  return <EngineerShell title="My Jobs" subtitle="Only work assigned to your engineer account is shown.">
    {error&&<div className="connection-note">{error}</div>}
    <div className="engineer-filter"><I.Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your jobs…"/></div>
    {!jobs?<Loading/>:<section className="engineer-job-list">{rows.map(job=><JobCard key={job.id} job={job}/>)}{!rows.length&&<div className="engineer-empty"><I.BriefcaseBusiness/><h3>No assigned jobs found</h3><p>New work will appear here after an administrator assigns it to you.</p></div>}</section>}
  </EngineerShell>;
}

export function EngineerSchedule(){
  const [jobs,setJobs]=useState(null),[error,setError]=useState('');
  useEffect(()=>{api.jobs.list().then(setJobs).catch(e=>setError(e.message))},[]);
  const groups=useMemo(()=>{const result={};for(const job of jobs||[]){const key=date(job.scheduledStart||job.dueDate);(result[key]??=[]).push(job)}return result},[jobs]);
  return <EngineerShell title="My Schedule" subtitle="Your assigned visits in date and time order.">{error&&<div className="connection-note">{error}</div>}{!jobs?<Loading/>:<div className="engineer-schedule">{Object.entries(groups).map(([day,items])=><section className="app-panel" key={day}><header><h2>{day}</h2><span>{items.length} job{items.length===1?'':'s'}</span></header>{items.map(job=><JobCard key={job.id} job={job}/>)}</section>)}{!jobs.length&&<div className="engineer-empty"><I.CalendarX/><h3>No work scheduled</h3></div>}</div>}</EngineerShell>;
}

export function EngineerJob(){
  const {id}=useParams();
  const [job,setJob]=useState(null),[notice,setNotice]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false);
  const load=()=>api.jobs.get(id).then(setJob).catch(e=>setNotice(e.message));
  useEffect(()=>{load()},[id]);
  const setStatus=async status=>{setBusy(true);try{await api.jobs.setStatus(id,status);await load();setNotice('Job status updated.')}catch(e){setNotice(e.message)}finally{setBusy(false)}};
  const addNote=async()=>{if(!note.trim())return;setBusy(true);try{await api.jobs.addNote(id,note);setNote('');await load();setNotice('Progress note added.')}catch(e){setNotice(e.message)}finally{setBusy(false)}};
  if(!job)return <EngineerShell title="Job details" subtitle="Opening assigned job…">{notice?<div className="connection-note">{notice}</div>:<Loading/>}</EngineerShell>;
  return <EngineerShell title={`${job.reference} · ${job.title}`} subtitle={`${job.customerName}${job.siteName?` · ${job.siteName}`:''}`} action={<Link className="app-button secondary" to="/engineer/jobs"><I.ArrowLeft/>My Jobs</Link>}>
    {notice&&<div className="connection-note">{notice}</div>}
    <div className="job-workflow-head"><div><small>Status</small><Status>{job.status}</Status></div><div><small>Priority</small><Status>{job.priority}</Status></div><div><small>Scheduled</small><b>{date(job.scheduledStart||job.dueDate)} · {time(job.scheduledStart)}</b></div><div><small>Job type</small><b>{job.jobType}</b></div></div>
    <div className="job-workflow-grid engineer-job-detail">
      <section className="app-panel"><header><h2><I.MapPin/> Site information</h2></header><h3>{job.siteName||'Site not specified'}</h3><p>{[job.siteAddress,job.sitePostcode].filter(Boolean).join(', ')||'Address not recorded'}</p>{job.accessInstructions&&<div className="engineer-access"><b>Access instructions</b><p>{job.accessInstructions}</p></div>}<hr/><h3>Work description</h3><p className="engineer-description">{job.description||'No description provided.'}</p></section>
      <section className="app-panel"><header><h2><I.Activity/> Update progress</h2></header><div className="engineer-status-actions">{['Scheduled','In Progress'].map(status=><button disabled={busy||job.status===status} className={job.status===status?'active':''} onClick={()=>setStatus(status)} key={status}>{status==='Scheduled'?<I.CalendarCheck/>:<I.Play/>}{status}</button>)}</div><p className="ai-report-help">Use the completion and customer sign-off form below to mark this job as completed.</p><hr/><h3>Add site note</h3><div className="job-note-compose"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Record work completed, findings or parts required…"/><button className="app-button" disabled={busy||!note.trim()} onClick={addNote}><I.Send/>Add Note</button></div></section>
      <section className="app-panel full"><header><h2><I.MessageSquareText/> Job notes</h2></header><div className="job-timeline">{job.notes.map(x=><article key={x.id}><I.MessageSquareText/><span><b>{x.author}</b><p>{x.body}</p><small>{new Date(x.createdAt).toLocaleString('en-GB')}</small></span></article>)}{!job.notes.length&&<p>No progress notes yet.</p>}</div></section>
      <CompletionWorkspace job={job} onCompleted={load}/>
    </div>
  </EngineerShell>;
}

const defaultChecks=['Work area made safe','Installation or service work completed','System tested and operating correctly','Customer shown how to use the system','Site left clean and tidy'];

function SignaturePad({value,onChange}){
  const canvas=useRef(null),drawing=useRef(false);
  useEffect(()=>{if(!value)return;const image=new Image();image.onload=()=>canvas.current?.getContext('2d').drawImage(image,0,0,canvas.current.width,canvas.current.height);image.src=value},[]);
  const point=e=>{const box=canvas.current.getBoundingClientRect(),source=e.touches?.[0]||e;return{x:(source.clientX-box.left)*canvas.current.width/box.width,y:(source.clientY-box.top)*canvas.current.height/box.height}};
  const start=e=>{e.preventDefault();drawing.current=true;const c=canvas.current.getContext('2d'),p=point(e);c.beginPath();c.moveTo(p.x,p.y)};
  const move=e=>{if(!drawing.current)return;e.preventDefault();const c=canvas.current.getContext('2d'),p=point(e);c.lineWidth=2.5;c.lineCap='round';c.strokeStyle='#111';c.lineTo(p.x,p.y);c.stroke()};
  const stop=()=>{if(!drawing.current)return;drawing.current=false;onChange(canvas.current.toDataURL('image/png'))};
  const clear=()=>{canvas.current.getContext('2d').clearRect(0,0,canvas.current.width,canvas.current.height);onChange(null)};
  return <div className="signature-pad"><canvas ref={canvas} width="700" height="180" onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerLeave={stop}/><button type="button" onClick={clear}><I.Eraser/>Clear signature</button></div>;
}

export function CompletionWorkspace({job,onCompleted}){
  const [form,setForm]=useState(null),[notice,setNotice]=useState('Loading completion form…'),[actionNotice,setActionNotice]=useState(''),[saving,setSaving]=useState(false),[photo,setPhoto]=useState(null),[caption,setCaption]=useState(''),[photoUrls,setPhotoUrls]=useState({});
  const load=()=>api.jobs.getCompletion(job.id).then(data=>{setForm({...data,checklist:data.checklist.length?data.checklist:defaultChecks.map(label=>({label,checked:false})),equipment:data.equipment||[]});setNotice('')}).catch(e=>setNotice(e.message));
  useEffect(()=>{load()},[job.id]);
  useEffect(()=>{if(!form)return;let cancelled=false;Promise.all(form.photos.map(async item=>[item.id,await api.jobs.photoUrl(job.id,item.id)])).then(entries=>{if(!cancelled)setPhotoUrls(Object.fromEntries(entries))});return()=>{cancelled=true;Object.values(photoUrls).forEach(url=>url&&URL.revokeObjectURL(url))}},[form?.photos?.length]);
  if(!form)return <section className="app-panel full completion-panel"><header><h2><I.ClipboardCheck/> Job completion</h2></header><Loading message={notice}/></section>;
  const update=(key,value)=>setForm(x=>({...x,[key]:value}));
  const changeEquipment=(index,key,value)=>update('equipment',form.equipment.map((item,i)=>i===index?{...item,[key]:value}:item));
  const payload=()=>({checklist:form.checklist,equipment:form.equipment.filter(x=>x.description.trim()).map(x=>({...x,quantity:Number(x.quantity)||1})),workSummary:form.workSummary,furtherWorkRequired:form.furtherWorkRequired,customerName:form.customerName,customerSignature:form.customerSignature});
  const generateAiReport=async()=>{setSaving(true);setActionNotice('Creating an evidence-based report draft…');try{const draft=await api.jobs.aiReportDraft(job.id,{checklist:form.checklist,equipment:form.equipment.filter(x=>x.description.trim()).map(x=>({...x,quantity:Number(x.quantity)||1})),engineerObservations:form.workSummary});setForm(current=>({...current,workSummary:draft.workSummary,furtherWorkRequired:draft.furtherWorkRequired||current.furtherWorkRequired}));setActionNotice(`${draft.mode}. ${draft.warnings.join(' ')} Review and edit the wording before saving.`)}catch(e){setActionNotice(`Could not generate report wording: ${e.message}`)}finally{setSaving(false)}};
  const save=async()=>{setSaving(true);setActionNotice('Saving your completion form…');try{await api.jobs.saveCompletion(job.id,payload());setActionNotice('Completion form saved securely.');await load()}catch(e){setActionNotice(`Could not save: ${e.message}`)}finally{setSaving(false)}};
  const upload=async()=>{if(!photo)return;setSaving(true);try{await api.jobs.uploadPhoto(job.id,photo,caption);setPhoto(null);setCaption('');setNotice('Site photo uploaded.');await load()}catch(e){setNotice(e.message)}finally{setSaving(false)}};
  const complete=async()=>{
    const missing=[];
    if(form.checklist.some(item=>!item.checked))missing.push('tick every checklist item');
    if(!form.workSummary.trim())missing.push('enter the work summary');
    if(form.customerName.trim().length<2)missing.push('enter the customer name');
    if(!form.customerSignature)missing.push('capture the customer signature');
    if(missing.length){setActionNotice(`Before completing this job: ${missing.join(', ')}.`);return}
    setSaving(true);setActionNotice('Saving the signed completion record…');
    try{
      await api.jobs.saveCompletion(job.id,payload());
      setActionNotice('Generating the branded service report…');
      await api.jobs.complete(job.id);
      await load();
      onCompleted();
      setActionNotice('Job completed. Your service report download is starting…');
      await api.jobs.downloadReport(job.id,job.reference);
      setActionNotice('Job completed successfully. Use Download Service Report below whenever you need another copy.');
    }catch(e){setActionNotice(`Could not complete the job: ${e.message}`)}
    finally{setSaving(false)}
  };
  return <section className="app-panel full completion-panel"><header><div><h2><I.ClipboardCheck/> Job completion & customer sign-off</h2><p>Complete this record before closing the job.</p></div>{form.completedAt&&<Status>Completed</Status>}</header>
    {notice&&<div className="connection-note">{notice}</div>}
    <div className="completion-section"><h3>1. Completion checklist</h3><div className="completion-checks">{form.checklist.map((item,index)=><label key={item.label}><input type="checkbox" checked={item.checked} disabled={Boolean(form.completedAt)} onChange={e=>update('checklist',form.checklist.map((x,i)=>i===index?{...x,checked:e.target.checked}:x))}/><span><I.CircleCheck/>{item.label}</span></label>)}</div></div>
    <div className="completion-section"><div className="completion-title"><h3>2. Work summary</h3>{!form.completedAt&&<button className="ai-report-button" type="button" disabled={saving} onClick={generateAiReport}><I.Sparkles/>{saving?'Generating…':'Generate AI Draft'}</button>}</div><p className="ai-report-help">Record factual site observations in the box first. AI will organise the job evidence into editable professional wording.</p><textarea disabled={Boolean(form.completedAt)} value={form.workSummary} onChange={e=>update('workSummary',e.target.value)} placeholder="Describe the work completed, tests performed and final system condition…"/><label>Further work required (optional)<textarea disabled={Boolean(form.completedAt)} value={form.furtherWorkRequired} onChange={e=>update('furtherWorkRequired',e.target.value)} placeholder="Record recommendations, defects or a return visit required…"/></label></div>
    <div className="completion-section"><div className="completion-title"><h3>3. Equipment and parts</h3>{!form.completedAt&&<button type="button" onClick={()=>update('equipment',[...form.equipment,{description:'',manufacturer:'',model:'',serialNumber:'',quantity:1}])}><I.Plus/>Add item</button>}</div><div className="equipment-list">{form.equipment.map((item,index)=><div key={index}><input disabled={Boolean(form.completedAt)} placeholder="Equipment or part" value={item.description} onChange={e=>changeEquipment(index,'description',e.target.value)}/><input disabled={Boolean(form.completedAt)} placeholder="Manufacturer" value={item.manufacturer} onChange={e=>changeEquipment(index,'manufacturer',e.target.value)}/><input disabled={Boolean(form.completedAt)} placeholder="Model" value={item.model} onChange={e=>changeEquipment(index,'model',e.target.value)}/><input disabled={Boolean(form.completedAt)} placeholder="Serial number" value={item.serialNumber} onChange={e=>changeEquipment(index,'serialNumber',e.target.value)}/><input disabled={Boolean(form.completedAt)} aria-label="Quantity" type="number" min="1" value={item.quantity} onChange={e=>changeEquipment(index,'quantity',e.target.value)}/>{!form.completedAt&&<button onClick={()=>update('equipment',form.equipment.filter((_,i)=>i!==index))}><I.Trash2/></button>}</div>)}</div></div>
    <div className="completion-section"><h3>4. Site photo evidence</h3>{!form.completedAt&&<div className="photo-upload"><label><I.Camera/>Choose site photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setPhoto(e.target.files[0]||null)}/></label><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Photo caption"/><button className="app-button" disabled={!photo||saving} onClick={upload}><I.Upload/>Upload</button></div>}<div className="completion-photos">{form.photos.map(item=><figure key={item.id}>{photoUrls[item.id]?<img src={photoUrls[item.id]} alt={item.caption||'Site evidence'}/>:<I.Image/>}<figcaption>{item.caption||'Site evidence'}</figcaption></figure>)}</div></div>
    <div className="completion-section"><h3>5. Customer sign-off</h3><p className="signoff-text">The customer confirms that the work described above has been completed and the system has been demonstrated where applicable.</p><label>Customer full name<input disabled={Boolean(form.completedAt)} value={form.customerName} onChange={e=>update('customerName',e.target.value)} placeholder="Name of customer or site representative"/></label>{form.completedAt&&form.customerSignature?<img className="saved-signature" src={form.customerSignature} alt="Customer signature"/>:<SignaturePad value={form.customerSignature} onChange={value=>update('customerSignature',value)}/>}</div>
    {actionNotice&&<div className={'completion-action-notice '+(actionNotice.startsWith('Could not')||actionNotice.startsWith('Before')?'error':'')} role="status"><I.Info/>{actionNotice}</div>}
    <footer className="completion-actions">{form.completedAt?<><button className="app-button secondary" onClick={()=>api.jobs.downloadReport(job.id,job.reference)}><I.Download/>Download Service Report</button><span><I.LockKeyhole/>Signed and completed {new Date(form.completedAt).toLocaleString('en-GB')}</span></>:<><button className="app-button secondary" disabled={saving} onClick={save}><I.Save/>{saving?'Please wait…':'Save Draft'}</button><button className="app-button" disabled={saving} onClick={complete}><I.CircleCheckBig/>{saving?'Generating Report…':'Complete Job & Generate Report'}</button></>}</footer>
  </section>;
}
