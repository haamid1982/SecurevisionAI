import React,{useEffect,useState} from 'react';
import * as I from 'lucide-react';
import {AppShell} from './app-pages.jsx';
import {api} from './api.js';

const date=value=>new Intl.DateTimeFormat('en-GB',{dateStyle:'full',timeStyle:'short'}).format(new Date(value));

export function AppointmentReminders(){
  const [items,setItems]=useState([]),[notice,setNotice]=useState('Checking the next 72 hours…'),[sending,setSending]=useState('');
  const load=()=>api.reminders.due().then(data=>{setItems(data);setNotice(data.length?'Review each appointment before sending its customer reminder.':'No customer reminders are due in the next 72 hours.')}).catch(error=>setNotice(error.message));
  useEffect(()=>{load()},[]);
  const send=async item=>{setSending(item.id);setNotice(`Sending reminder to ${item.email}…`);try{await api.reminders.send(item.id);setNotice(`Reminder sent to ${item.email}.`);await load()}catch(error){setNotice(error.message)}finally{setSending('')}};
  return <AppShell title="Appointment Reminders" subtitle="Send reviewed email reminders for upcoming customer visits."><div className="connection-note"><I.MailCheck/>{notice}</div><section className="app-panel reminder-list"><header><h2><I.CalendarClock/>Due within 72 hours</h2><span>{items.filter(item=>!item.alreadySent).length} awaiting delivery</span></header>{items.length===0?<div className="notification-empty"><I.CalendarCheck/><h2>No reminders due</h2><p>Schedule a job within the next 72 hours and make sure its customer has an email address.</p></div>:items.map(item=><article className={item.alreadySent?'sent':''} key={item.id}><div className="reminder-date"><I.CalendarDays/><span><b>{date(item.scheduledStart)}</b><small>{item.scheduledEnd?`Ends ${new Date(item.scheduledEnd).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}`:'End time not recorded'}</small></span></div><div className="reminder-details"><small>{item.reference}</small><h3>{item.title}</h3><p><I.Building2/>{item.customerName}{item.siteName?` · ${item.siteName}`:''}</p><p><I.Mail/>{item.email}</p><p><I.HardHat/>{item.engineerName}</p></div><div className="reminder-action">{item.alreadySent?<><span><I.CircleCheck/>Sent</span><small>{new Date(item.sentAt).toLocaleString('en-GB')}</small></>:<button className="app-button" disabled={Boolean(sending)} onClick={()=>send(item)}>{sending===item.id?<><I.LoaderCircle/>Sending…</>:<><I.Send/>Review & Send</>}</button>}</div></article>)}</section><div className="reminder-safety"><I.ShieldCheck/><p>SecureVision will never send these messages merely because this page was opened. An administrator reviews and sends each reminder, and duplicate delivery for the same appointment time is prevented.</p></div></AppShell>;
}
