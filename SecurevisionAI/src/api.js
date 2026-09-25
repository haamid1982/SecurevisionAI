const API_URL=import.meta.env.VITE_API_URL||'http://127.0.0.1:3001/api';
export const apiUrl=API_URL;

async function request(path,options={}){
  const headers={'Content-Type':'application/json',...options.headers};
  const token=globalThis.__secureVisionToken;
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API_URL}${path}`,{...options,headers});
  if(response.status===204)return null;
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error?.message||`Request failed (${response.status})`);
  return body.data??body;
}

async function download(path,filename){
  const headers={};
  const token=globalThis.__secureVisionToken;
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API_URL}${path}`,{headers});
  if(!response.ok){
    const body=await response.json().catch(()=>({}));
    throw new Error(body.error?.message||`Download failed (${response.status})`);
  }
  const url=URL.createObjectURL(await response.blob());
  const link=document.createElement('a');
  link.href=url;
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function uploadFile(path,file){
  const headers={'Content-Type':file.type};
  const token=globalThis.__secureVisionToken;
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API_URL}${path}`,{method:'PUT',headers,body:file});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error?.message||`Upload failed (${response.status})`);
  return body.data??body;
}

async function uploadPhoto(path,file,caption=''){
  const headers={'Content-Type':file.type,'X-Photo-Caption':caption};
  const token=globalThis.__secureVisionToken;
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API_URL}${path}`,{method:'POST',headers,body:file});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error?.message||`Upload failed (${response.status})`);
  return body.data??body;
}

async function authenticatedImage(path){
  const headers={};
  const token=globalThis.__secureVisionToken;
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API_URL}${path}`,{headers});
  if(response.status===404)return null;
  if(!response.ok)throw new Error(`Unable to load image (${response.status})`);
  return URL.createObjectURL(await response.blob());
}

export const api={
  health:()=>fetch(`${API_URL}/health`).then(r=>r.json()),
  me:()=>request('/me'),
  account:{update:data=>request('/me',{method:'PATCH',body:JSON.stringify(data)})},
  company:{get:()=>request('/company'),create:data=>request('/company',{method:'POST',body:JSON.stringify(data)}),update:data=>request('/company',{method:'PUT',body:JSON.stringify(data)}),uploadLogo:file=>uploadFile('/company/logo',file),getLogo:()=>authenticatedImage('/company/logo')},
  billing:{get:()=>request('/billing'),update:data=>request('/billing',{method:'PUT',body:JSON.stringify(data)})},
  team:{list:()=>request('/team'),invite:data=>request('/team/invitations',{method:'POST',body:JSON.stringify(data)}),cancel:id=>request(`/team/invitations/${id}`,{method:'DELETE'}),update:(uid,data)=>request(`/team/members/${uid}`,{method:'PATCH',body:JSON.stringify(data)})},
  engineers:{list:()=>request('/engineers'),create:data=>request('/engineers',{method:'POST',body:JSON.stringify(data)})},
  customers:{list:(search='')=>request(`/customers?search=${encodeURIComponent(search)}`),get:id=>request(`/customers/${id}`),create:data=>request('/customers',{method:'POST',body:JSON.stringify(data)}),update:(id,data)=>request(`/customers/${id}`,{method:'PUT',body:JSON.stringify(data)}),archive:id=>request(`/customers/${id}`,{method:'DELETE'}),addContact:(id,data)=>request(`/customers/${id}/contacts`,{method:'POST',body:JSON.stringify(data)}),addSite:(id,data)=>request(`/customers/${id}/sites`,{method:'POST',body:JSON.stringify(data)}),addAsset:(id,data)=>request(`/customers/${id}/assets`,{method:'POST',body:JSON.stringify(data)}),invitePortal:(id,data)=>request(`/customers/${id}/portal-invite`,{method:'POST',body:JSON.stringify(data)})},
  jobs:{list:(search='')=>request(`/jobs?search=${encodeURIComponent(search)}`),get:id=>request(`/jobs/${id}`),create:data=>request('/jobs',{method:'POST',body:JSON.stringify(data)}),setStatus:(id,status)=>request(`/jobs/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}),schedule:(id,data)=>request(`/jobs/${id}/schedule`,{method:'PATCH',body:JSON.stringify(data)}),addNote:(id,body)=>request(`/jobs/${id}/notes`,{method:'POST',body:JSON.stringify({body})}),getCompletion:id=>request(`/jobs/${id}/completion`),saveCompletion:(id,data)=>request(`/jobs/${id}/completion`,{method:'PUT',body:JSON.stringify(data)}),aiReportDraft:(id,data)=>request(`/jobs/${id}/ai-report-draft`,{method:'POST',body:JSON.stringify(data)}),uploadPhoto:(id,file,caption)=>uploadPhoto(`/jobs/${id}/photos`,file,caption),photoUrl:(id,photoId)=>authenticatedImage(`/jobs/${id}/photos/${photoId}`),complete:id=>request(`/jobs/${id}/complete`,{method:'POST'}),downloadReport:(id,reference)=>download(`/jobs/${id}/service-report.pdf`,`${reference}-service-report.pdf`),sendReport:id=>request(`/jobs/${id}/service-report/send`,{method:'POST'})},
  quotes:{list:()=>request('/quotes'),get:id=>request(`/quotes/${id}`),create:data=>request('/quotes',{method:'POST',body:JSON.stringify(data)}),update:(id,data)=>request(`/quotes/${id}`,{method:'PUT',body:JSON.stringify(data)}),setStatus:(id,status)=>request(`/quotes/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}),toInvoice:id=>request(`/quotes/${id}/invoice`,{method:'POST'}),toJob:(id,data)=>request(`/quotes/${id}/job`,{method:'POST',body:JSON.stringify(data)}),downloadPdf:(id,reference)=>download(`/quotes/${id}/pdf`,`${reference}.pdf`),send:id=>request(`/quotes/${id}/send`,{method:'POST'})},
  invoices:{list:()=>request('/invoices'),addPayment:(id,data)=>request(`/invoices/${id}/payments`,{method:'POST',body:JSON.stringify(data)}),downloadPdf:(id,reference)=>download(`/invoices/${id}/pdf`,`${reference}.pdf`),send:id=>request(`/invoices/${id}/send`,{method:'POST'})},
  publicQuote:{get:token=>request(`/public/quotes/${token}`),decide:(token,data)=>request(`/public/quotes/${token}/decision`,{method:'POST',body:JSON.stringify(data)})},
  publicContact:{send:data=>request('/public/contact',{method:'POST',body:JSON.stringify(data)})},
  portal:{get:()=>request('/portal'),createRequest:data=>request('/portal/service-requests',{method:'POST',body:JSON.stringify(data)}),downloadQuote:(id,reference)=>download(`/portal/quotes/${id}/pdf`,`${reference}.pdf`),downloadInvoice:(id,reference)=>download(`/portal/invoices/${id}/pdf`,`${reference}.pdf`),downloadReport:(id,reference)=>download(`/portal/jobs/${id}/service-report.pdf`,`${reference}-service-report.pdf`)},
  serviceRequests:{list:()=>request('/service-requests'),update:(id,data)=>request(`/service-requests/${id}`,{method:'PATCH',body:JSON.stringify(data)}),toJob:(id,data)=>request(`/service-requests/${id}/job`,{method:'POST',body:JSON.stringify(data)})},
  inventory:{list:(search='')=>request(`/inventory?search=${encodeURIComponent(search)}`),create:data=>request('/inventory',{method:'POST',body:JSON.stringify(data)}),adjust:(id,data)=>request(`/inventory/${id}/movements`,{method:'POST',body:JSON.stringify(data)}),archive:id=>request(`/inventory/${id}`,{method:'DELETE'})},
  notifications:{list:()=>request('/notifications'),read:key=>request(`/notifications/${encodeURIComponent(key)}/read`,{method:'POST'}),readAll:()=>request('/notifications/read-all',{method:'POST'})},
  reminders:{due:()=>request('/reminders/due'),send:jobId=>request(`/reminders/${jobId}/send`,{method:'POST'})},
  audit:{list:()=>request('/audit-activity')},
  analytics:{get:(months=6)=>request(`/analytics?months=${months}`)},
  assistant:{ask:prompt=>request('/assistant/query',{method:'POST',body:JSON.stringify({prompt})}),quoteDraft:data=>request('/assistant/quote-draft',{method:'POST',body:JSON.stringify(data)})},
};

export function useApiData(loader,fallback){
  return {loader,fallback};
}
