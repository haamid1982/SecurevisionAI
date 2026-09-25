import React from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {AppShell} from './app-pages.jsx';
import {QuoteBuilder} from './quote-builder.jsx';

export function AiQuoteGenerator(){
  const navigate=useNavigate(),[searchParams]=useSearchParams();
  return <AppShell title="AI Quote Generator" subtitle="Generate a company-aware suggestion, then review every detail before saving."><QuoteBuilder initialBrief={searchParams.get('brief')||''} onSaved={()=>navigate('/app/quotes',{replace:true})}/></AppShell>;
}
