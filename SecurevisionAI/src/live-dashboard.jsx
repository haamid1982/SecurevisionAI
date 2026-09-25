import React,{useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import * as I from 'lucide-react';
import {AppShell} from './app-pages.jsx';
import {api} from './api.js';
import './live-dashboard.css';

const money=value=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number(value||0));
const date=value=>value?new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'Not scheduled';
const time=value=>value?new Date(value).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'';
const initial={analytics:{summary:{},monthly:[],jobStatuses:[]},jobs:[],invoices:[],engineers:[],user:null};

function Panel({title,link,children}){return <section className="app-panel live-dash-panel"><header><h2>{title}</h2>{link&&<Link to={link[0]}>{link[1]} <I.ArrowRight/></Link>}</header>{children}</section>}
function Empty({children}){return <div className="dash-empty"><I.Inbox/><span>{children}</span></div>}

export function LiveDashboard(){
  const [data,setData]=useState(initial),[notice,setNotice]=useState('Loading your business workspace…');
  useEffect(()=>{let active=true;Promise.all([api.analytics.get(6),api.jobs.list(),api.invoices.list(),api.engineers.list(),api.me()]).then(([analytics,jobs,invoices,engineers,session])=>{if(active){setData({analytics,jobs,invoices,engineers,user:session.user});setNotice('Live company data connected')}}).catch(error=>{if(active)setNotice(error.message)});return()=>{active=false}},[]);
  const summary=data.analytics.summary||{},upcoming=useMemo(()=>data.jobs.filter(j=>j.status!=='Completed'&&j.status!=='Cancelled').sort((a,b)=>new Date(a.scheduledStart||a.dueDate)-new Date(b.scheduledStart||b.dueDate)).slice(0,5),[data.jobs]);
  const maxJobs=Math.max(1,...data.analytics.monthly.map(x=>Number(x.completed))),outstanding=data.invoices.filter(x=>Number(x.balance)>0),paid=data.invoices.reduce((n,x)=>n+Number(x.total-x.balance),0);
  const available=data.engineers.filter(x=>x.status==='Available').length,onJob=data.engineers.filter(x=>x.status==='On Job').length;
  const firstName=data.user?.fullName?.split(' ')[0]||'there';
  return <AppShell title="Dashboard" subtitle={`Welcome back, ${firstName}. Here’s what’s happening across your business.`} action={<Link className="app-button" to="/app/jobs"><I.Plus/>Create Job</Link>}>
    <div className="connection-note"><I.Database/>{notice}</div>
    <div className="metric-grid">{[[I.BriefcaseBusiness,'Active jobs',summary.activeJobs,'red'],[I.CircleCheckBig,'Completed (6 months)',summary.completedJobs,'green'],[I.Banknote,'Revenue collected',money(summary.revenue),'blue'],[I.ReceiptPoundSterling,'Outstanding',money(summary.outstanding),'amber']].map(([Icon,label,value,tone])=><article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon/></div><span><small>{label}</small><strong>{value??'—'}</strong><em>Live company data</em></span></article>)}</div>
    <div className="live-dash-primary">
      <Panel title="Completed Jobs Trend" link={['/app/reports','Full analytics']}><div className="dash-mini-chart">{data.analytics.monthly.map(x=><div key={x.label}><b>{x.completed}</b><i style={{height:`${Math.max(4,Number(x.completed)/maxJobs*100)}%`}}/><span>{x.label}</span></div>)}</div></Panel>
      <Panel title="Upcoming Jobs" link={['/app/schedule','Open schedule']}>{upcoming.length?<div className="dash-upcoming">{upcoming.map(j=><Link to={`/app/jobs/${j.id}`} key={j.id}><div><b>{date(j.scheduledStart||j.dueDate)}</b><small>{time(j.scheduledStart)}</small></div><span><strong>{j.title}</strong><small>{j.customerName} · {j.engineerName||'Unassigned'}</small></span><em>{j.status}</em></Link>)}</div>:<Empty>No upcoming jobs</Empty>}</Panel>
    </div>
    <div className="live-dash-secondary">
      <Panel title="Service Requests" link={['/app/requests','Review requests']}><div className="dash-focus"><I.MessageSquareText/><strong>{summary.openRequests??0}</strong><span>awaiting review</span></div></Panel>
      <Panel title="Invoice Position" link={['/app/invoices','View invoices']}><div className="dash-money"><span><small>Collected</small><b>{money(paid)}</b></span><span><small>Invoices owing</small><b>{outstanding.length}</b></span></div><div className="dash-progress"><i style={{width:`${paid+Number(summary.outstanding)>0?paid/(paid+Number(summary.outstanding))*100:0}%`}}/></div></Panel>
      <Panel title="Engineer Availability" link={['/app/engineers','Manage team']}><div className="dash-engineers"><div><strong>{data.engineers.length}</strong><small>Total engineers</small></div><ul><li><i className="available"/>Available <b>{available}</b></li><li><i className="busy"/>On job <b>{onJob}</b></li><li><i/>Other <b>{Math.max(0,data.engineers.length-available-onJob)}</b></li></ul></div></Panel>
    </div>
    <div className="dash-shortcuts"><Link to="/app/customers"><I.Users/><span><b>{summary.activeCustomers??0} active customers</b><small>Open customer management</small></span><I.ChevronRight/></Link><Link to="/app/inventory"><I.PackageOpen/><span><b>Equipment & stock</b><small>Check stock levels and movements</small></span><I.ChevronRight/></Link><Link to="/app/assistant"><I.BrainCircuit/><span><b>SecureVision AI Assistant</b><small>Ask questions using current company records</small></span><I.ChevronRight/></Link></div>
  </AppShell>
}
