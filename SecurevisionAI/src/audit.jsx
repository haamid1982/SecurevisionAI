import React,{useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import * as I from 'lucide-react';
import {AppShell} from './app-pages.jsx';
import {api} from './api.js';

const icons={Job:I.BriefcaseBusiness,Inventory:I.PackageOpen,Document:I.FileCheck2,Payment:I.BadgePoundSterling,Customer:I.Users,Reminder:I.MailCheck};

export function AuditActivity(){
  const [items,setItems]=useState([]),[query,setQuery]=useState(''),[category,setCategory]=useState('All'),[notice,setNotice]=useState('Loading company activity…');
  useEffect(()=>{api.audit.list().then(data=>{setItems(data);setNotice(`${data.length} recorded activities loaded from PostgreSQL.`)}).catch(error=>setNotice(error.message))},[]);
  const categories=['All',...new Set(items.map(item=>item.category))];
  const visible=useMemo(()=>items.filter(item=>(category==='All'||item.category===category)&&[item.action,item.subject,item.detail,item.actor].join(' ').toLowerCase().includes(query.toLowerCase())),[items,query,category]);
  const time=value=>new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
  return <AppShell title="Audit Activity" subtitle="A read-only accountability record of important company actions."><div className="connection-note"><I.ShieldCheck/>{notice}</div><div className="audit-toolbar"><div className="table-search"><I.Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search action, record or person…"/></div><select value={category} onChange={event=>setCategory(event.target.value)}>{categories.map(value=><option key={value}>{value}</option>)}</select></div><section className="app-panel audit-list">{visible.length===0?<div className="notification-empty"><I.History/><h2>No matching activity</h2><p>Operational actions will appear after your team uses the platform.</p></div>:visible.map(item=>{const EventIcon=icons[item.category]||I.Activity;return <article key={`${item.category}-${item.id}`}><div className="audit-icon"><EventIcon/></div><div><span><b>{item.action}</b><em>{item.category}</em></span><h3>{item.subject}</h3><p>{item.detail}</p><small><I.UserRound/>{item.actor}<I.Clock3/>{time(item.createdAt)}</small></div><Link to={item.link} aria-label={`Open ${item.subject}`}><I.ArrowUpRight/></Link></article>})}</section><div className="audit-note"><I.LockKeyhole/>This view is read-only and restricted to administrators in your company workspace.</div></AppShell>;
}
