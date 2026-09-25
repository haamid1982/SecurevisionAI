import React,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import * as I from 'lucide-react';
import {AppShell} from './app-pages.jsx';
import {api} from './api.js';

const eventIcon=type=>type==='Service request'?I.MessageSquareWarning:type==='Quotation response'?I.FileCheck2:type==='Job completed'?I.ClipboardCheck:I.PackageSearch;
const eventTime=value=>new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));

export function Notifications(){
  const navigate=useNavigate();
  const [items,setItems]=useState([]),[notice,setNotice]=useState('Loading notifications…'),[busy,setBusy]=useState(false);
  useEffect(()=>{api.notifications.list().then(data=>{setItems(data);setNotice(data.length?'Showing operational activity from the last 90 days.':'You have no notifications.')}).catch(error=>setNotice(error.message))},[]);
  const open=async item=>{try{if(!item.isRead)await api.notifications.read(item.key)}finally{navigate(item.link)}};
  const readAll=async()=>{setBusy(true);try{await api.notifications.readAll();setItems(current=>current.map(item=>({...item,isRead:true})));setNotice('All notifications marked as read.')}catch(error){setNotice(error.message)}finally{setBusy(false)}};
  const action=<button className="app-button secondary" onClick={readAll} disabled={busy||!items.some(item=>!item.isRead)}><I.CheckCheck/>{busy?'Updating…':'Mark All Read'}</button>;
  return <AppShell title="Notifications" subtitle="Review important activity across your company." action={action}><div className="connection-note"><I.Bell/>{notice}</div><section className="app-panel notification-list">{items.length===0?<div className="notification-empty"><I.BellOff/><h2>Nothing needs your attention</h2><p>New service requests, quote responses, completed jobs and low-stock warnings will appear here.</p></div>:items.map(item=>{const EventIcon=eventIcon(item.type);return <button className={item.isRead?'read':'unread'} onClick={()=>open(item)} key={item.key}><span className="notification-icon"><EventIcon/></span><span><small>{item.type}</small><b>{item.title}</b><p>{item.message}</p><time>{eventTime(item.createdAt)}</time></span>{!item.isRead&&<i aria-label="Unread"/>}<I.ChevronRight/></button>})}</section></AppShell>;
}
