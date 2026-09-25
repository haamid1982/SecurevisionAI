import React,{useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import * as I from 'lucide-react';
import {AppShell} from './app-pages.jsx';
import {api} from './api.js';

const mondayOf=value=>{const date=new Date(value);date.setHours(0,0,0,0);date.setDate(date.getDate()-((date.getDay()+6)%7));return date};
const addDays=(date,amount)=>{const result=new Date(date);result.setDate(result.getDate()+amount);return result};
const key=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const label=date=>date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
const time=value=>value?new Date(value).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'TBC';
const activeJob=job=>!['Completed','Cancelled'].includes(job.status);

export function LiveSchedule(){
  const [week,setWeek]=useState(()=>mondayOf(new Date()));
  const [jobs,setJobs]=useState([]);
  const [engineers,setEngineers]=useState([]);
  const [selected,setSelected]=useState(null);
  const [notice,setNotice]=useState('Loading live schedule…');
  const [busy,setBusy]=useState(false);
  const load=()=>Promise.all([api.jobs.list(),api.engineers.list()]).then(([work,team])=>{setJobs(work);setEngineers(team);setNotice('Live schedule connected to PostgreSQL')}).catch(error=>setNotice(error.message));
  useEffect(()=>{load()},[]);

  const days=useMemo(()=>Array.from({length:7},(_,index)=>addDays(week,index)),[week]);
  const scheduled=jobs.filter(job=>activeJob(job)&&job.scheduledStart&&days.some(day=>key(day)===key(new Date(job.scheduledStart))));
  const unscheduled=jobs.filter(job=>activeJob(job)&&!job.scheduledStart);
  const rows=[{id:null,fullName:'Unassigned',status:'Needs assignment'},...engineers];
  const jobsFor=(engineer,day)=>scheduled.filter(job=>key(new Date(job.scheduledStart))===key(day)&&(engineer.id?job.engineerProfileId===engineer.id:!job.engineerProfileId));
  const save=async event=>{event.preventDefault();setBusy(true);const form=Object.fromEntries(new FormData(event.currentTarget));const data={engineerId:form.engineerId||null,engineerUid:null,siteId:null,scheduledStart:new Date(form.scheduledStart).toISOString(),scheduledEnd:new Date(form.scheduledEnd).toISOString()};try{await api.jobs.schedule(selected.id,data);setSelected(null);setNotice('Schedule and engineer assignment updated.');await load()}catch(error){setNotice(error.message)}finally{setBusy(false)}};

  return <AppShell title="Schedule" subtitle="Live engineer workload and job planning." action={<Link className="app-button" to="/app/jobs"><I.CalendarPlus/>Open Jobs</Link>}>
    <div className="connection-note"><I.Database/>{notice}</div>
    <div className="schedule-toolbar">
      <div><button onClick={()=>setWeek(addDays(week,-7))} aria-label="Previous week"><I.ChevronLeft/></button><button onClick={()=>setWeek(mondayOf(new Date()))}>Today</button><button onClick={()=>setWeek(addDays(week,7))} aria-label="Next week"><I.ChevronRight/></button></div>
      <h2>{days[0].toLocaleDateString('en-GB',{day:'numeric',month:'long'})} – {days[6].toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</h2>
      <span>{scheduled.length} scheduled</span>
    </div>
    <div className="live-calendar">
      <div className="live-cal-head"><span>Engineer</span>{days.map(day=><span key={key(day)}>{label(day)}</span>)}</div>
      {rows.map(engineer=><div className="live-cal-row" key={engineer.id||'unassigned'}>
        <div className="live-engineer"><div>{engineer.id?engineer.fullName.split(' ').map(part=>part[0]).join('').slice(0,2):'?'}</div><span><b>{engineer.fullName}</b><small>{engineer.status}</small></span></div>
        {days.map(day=><div className="live-day" key={key(day)}>{jobsFor(engineer,day).map(job=><button className={'schedule-job '+(job.priority||'').toLowerCase()} key={job.id} onClick={()=>setSelected(job)}><b>{job.title}</b><small>{time(job.scheduledStart)}–{time(job.scheduledEnd)}</small><small>{job.customerName}</small></button>)}</div>)}
      </div>)}
    </div>
    <section className="app-panel unscheduled"><header><h2>Unscheduled work</h2><span>{unscheduled.length}</span></header><div>{unscheduled.map(job=><button key={job.id} onClick={()=>setSelected(job)}><I.BriefcaseBusiness/><span><b>{job.reference} · {job.title}</b><small>{job.customerName} · Due {new Date(job.dueDate).toLocaleDateString('en-GB')}</small></span><I.CalendarPlus/></button>)}</div></section>
    {selected&&<div className="app-modal-backdrop"><form className="app-modal" onSubmit={save}>
      <header><div><h2>Schedule {selected.reference}</h2><p>{selected.title} · {selected.customerName}</p></div><button type="button" onClick={()=>setSelected(null)}><I.X/></button></header>
      <div className="modal-grid"><label className="full">Engineer<select name="engineerId" defaultValue={selected.engineerProfileId||''}><option value="">Unassigned</option>{engineers.map(engineer=><option value={engineer.id} key={engineer.id}>{engineer.fullName} · {engineer.status}</option>)}</select></label><label>Start<input name="scheduledStart" type="datetime-local" required defaultValue={selected.scheduledStart?selected.scheduledStart.slice(0,16):''}/></label><label>End<input name="scheduledEnd" type="datetime-local" required defaultValue={selected.scheduledEnd?selected.scheduledEnd.slice(0,16):''}/></label></div>
      <footer><button type="button" className="app-button secondary" onClick={()=>setSelected(null)}>Cancel</button><button className="app-button" disabled={busy}>{busy?'Saving…':'Save Schedule'}</button></footer>
    </form></div>}
  </AppShell>;
}
