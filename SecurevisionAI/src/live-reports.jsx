import React,{useEffect,useMemo,useState} from 'react';
import * as I from 'lucide-react';
import {AppShell} from './app-pages.jsx';
import {api} from './api.js';
import './live-reports.css';

const money=value=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number(value||0));
const Button=({children,onClick})=><button className="app-button secondary" onClick={onClick}>{children}</button>;
const empty={summary:{},monthly:[],jobTypes:[],jobStatuses:[],engineers:[],customers:[]};

function csvCell(value){return `"${String(value??'').replaceAll('"','""')}"`}
function downloadCsv(data,months){
  const rows=[['SecureVision AI analytics'],['Reporting period',`Last ${months} months`],[],['Summary','Value'],['Completed jobs',data.summary.completedJobs],['Active jobs',data.summary.activeJobs],['Revenue collected',data.summary.revenue],['Outstanding invoices',data.summary.outstanding],['Active customers',data.summary.activeCustomers],['Open service requests',data.summary.openRequests],[],['Month','Revenue collected','Completed jobs'],...data.monthly.map(x=>[x.label,x.revenue,x.completed]),[],['Job type','Jobs'],...data.jobTypes.map(x=>[x.label,x.value]),[],['Engineer','Assigned jobs','Completed jobs'],...data.engineers.map(x=>[x.name,x.jobs,x.completed]),[],['Customer','Jobs','Invoice value'],...data.customers.map(x=>[x.name,x.jobs,x.value])];
  const blob=new Blob([rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`securevision-analytics-${months}-months.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
}

function Panel({title,children}){return <section className="app-panel report-panel"><header><h2>{title}</h2></header>{children}</section>}
function Empty({children}){return <div className="report-empty"><I.ChartNoAxesColumnIncreasing/><span>{children}</span></div>}
function RankedList({rows,value}){return rows.length?<div className="live-rank-list">{rows.map((row,index)=><div key={row.name}><b>{index+1}</b><span><strong>{row.name}</strong><small>{row.jobs} job{Number(row.jobs)===1?'':'s'}</small></span><em>{value(row)}</em></div>)}</div>:<Empty>No activity recorded yet</Empty>}

export function LiveReports(){
  const [months,setMonths]=useState(6),[data,setData]=useState(empty),[notice,setNotice]=useState('Loading live analytics…'),[loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;setLoading(true);api.analytics.get(months).then(result=>{if(active){setData(result);setNotice(`Live PostgreSQL data · last ${months} months`)}}).catch(error=>{if(active)setNotice(error.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[months]);
  const maxRevenue=Math.max(1,...data.monthly.map(x=>Number(x.revenue))),totalTypes=data.jobTypes.reduce((sum,x)=>sum+Number(x.value),0);
  const typeGradient=useMemo(()=>{const colours=['#ef233c','#3998da','#ffad32','#42c882','#8b6cff','#777'];let cursor=0;const stops=data.jobTypes.slice(0,6).map((x,i)=>{const start=cursor;cursor+=totalTypes?Number(x.value)/totalTypes*100:0;return `${colours[i]} ${start}% ${cursor}%`});return stops.length?`conic-gradient(${stops.join(',')})`:'#25272b'},[data.jobTypes,totalTypes]);
  const s=data.summary;
  return <AppShell title="Reports & Analytics" subtitle="Monitor performance using live operational and financial data." action={<Button onClick={()=>downloadCsv(data,months)}><I.Download/>Export CSV</Button>}>
    <div className="report-controls"><div className="connection-note"><I.Database/>{notice}</div><label>Reporting period<select value={months} onChange={e=>setMonths(Number(e.target.value))}><option value="3">Last 3 months</option><option value="6">Last 6 months</option><option value="12">Last 12 months</option><option value="24">Last 24 months</option></select></label></div>
    <div className="analytics-metrics">{[[I.CircleCheckBig,'Completed jobs',s.completedJobs],[I.BriefcaseBusiness,'Active jobs',s.activeJobs],[I.Banknote,'Revenue collected',money(s.revenue)],[I.ReceiptPoundSterling,'Outstanding',money(s.outstanding)],[I.Users,'Active customers',s.activeCustomers],[I.MessageSquareText,'Open requests',s.openRequests]].map(([Icon,label,value])=><article key={label}><Icon/><span><small>{label}</small><strong>{loading?'—':value??0}</strong></span></article>)}</div>
    <div className="live-report-grid">
      <Panel title="Revenue & Completed Jobs">{data.monthly.length?<div className="live-bar-chart">{data.monthly.map(x=><div key={x.label}><div className="bar-value">{money(x.revenue)}</div><div className="bar-track"><i style={{height:`${Math.max(3,Number(x.revenue)/maxRevenue*100)}%`}}><em>{x.completed}</em></i></div><span>{x.label}</span></div>)}</div>:<Empty>No monthly activity recorded yet</Empty>}</Panel>
      <Panel title="Jobs by Type">{data.jobTypes.length?<div className="live-donut-row"><div className="live-donut" style={{background:typeGradient}}><span><b>{totalTypes}</b><small>Total jobs</small></span></div><ul>{data.jobTypes.slice(0,6).map((x,i)=><li key={x.label}><i className={`colour-${i}`}/><span>{x.label||'Unspecified'}</span><b>{x.value}</b></li>)}</ul></div>:<Empty>No job types recorded yet</Empty>}</Panel>
      <Panel title="Engineer Workload"><RankedList rows={data.engineers} value={x=><>{x.completed} completed</>}/></Panel>
      <Panel title="Top Customers"><RankedList rows={data.customers} value={x=>money(x.value)}/></Panel>
      <Panel title="Current Job Status"><div className="status-breakdown">{data.jobStatuses.map(x=>{const total=data.jobStatuses.reduce((n,y)=>n+Number(y.value),0);return <div key={x.label}><span><b>{x.label}</b><em>{x.value}</em></span><div><i style={{width:`${total?Number(x.value)/total*100:0}%`}}/></div></div>})}{!data.jobStatuses.length&&<Empty>No jobs recorded yet</Empty>}</div></Panel>
      <Panel title="What These Figures Mean"><div className="report-guidance"><I.ShieldCheck/><p>Every figure is restricted to your company. Revenue is calculated from invoice payments received; outstanding is the unpaid invoice balance. Cancelled jobs are excluded from active jobs.</p></div></Panel>
    </div>
  </AppShell>
}
