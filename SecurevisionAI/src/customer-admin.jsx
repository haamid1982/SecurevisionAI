import React,{useEffect,useState} from 'react';
import * as I from 'lucide-react';
import {AppShell} from './app-pages.jsx';
import {api} from './api.js';
import './customer-styles.css';

export function CustomerPortalAccess(){
  const [customers,setCustomers]=useState([]),[notice,setNotice]=useState('Loading customers…'),[busy,setBusy]=useState(false);
  useEffect(()=>{api.customers.list().then(rows=>{setCustomers(rows);setNotice('Select a customer and invite their authorised contact.')}).catch(e=>setNotice(e.message))},[]);
  const submit=async e=>{e.preventDefault();setBusy(true);const data=Object.fromEntries(new FormData(e.currentTarget));const customerId=data.customerId;delete data.customerId;try{const result=await api.customers.invitePortal(customerId,data);setNotice(`Invitation created for ${result.email}. Send them this registration link: ${result.signupUrl}`);e.currentTarget.reset()}catch(error){setNotice(error.message)}finally{setBusy(false)}};
  return <AppShell title="Customer Portal Access" subtitle="Invite an authorised customer contact to their private portal."><div className="connection-note"><I.ShieldCheck/>{notice}</div><div className="crm-grid"><form className="app-panel portal-request" onSubmit={submit}><header><h2><I.UserRoundPlus/>Create customer invitation</h2></header><label>Customer<select name="customerId" required defaultValue=""><option value="" disabled>Select customer</option>{customers.map(x=><option key={x.id} value={x.id}>{x.companyName}</option>)}</select></label><label>Contact full name<input name="fullName" required minLength="2"/></label><label>Contact email<input name="email" type="email" required/></label><button className="app-button" disabled={busy}><I.Send/>{busy?'Creating invitation…':'Invite Customer'}</button></form><section className="app-panel"><header><h2>How customer access works</h2></header><div className="portal-account"><p>1. Select the CRM customer record.</p><p>2. Enter the authorised contact's exact email address.</p><p>3. Send them the customer registration link.</p><p>4. They register with that exact email.</p><p>5. SecureVision links their login only to that customer record.</p></div></section></div></AppShell>;
}
