import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {generateQuoteDraft,generateReportDraft,quoteIntentAction} from '../server/assistant.js';

test('quote generator uses stored inventory prices and leaves labour for review',async()=>{
  const context={company:{name:'4K Security',currency:'GBP',services:['CCTV']},customer:{id:'c1',name:'Test Customer'},site:null,inventory:[{id:'i1',sku:'CAM-1',name:'External CCTV camera',category:'CCTV',manufacturer:'Example',salePrice:125,available:10}]};
  const draft=await generateQuoteDraft('Supply and install four external CCTV cameras with commissioning.',context);
  const camera=draft.items.find(item=>item.inventoryId==='i1'),labour=draft.items.find(item=>item.inventoryId===null);
  assert.equal(camera.unitPrice,125);assert.equal(camera.quantity,4);assert.equal(labour.unitPrice,0);assert.match(draft.disclaimer,/administrator must verify/i);
});

test('report generator only organises supplied job evidence',async()=>{
  const job={reference:'JOB-1001',title:'Camera repair',description:'Investigate failed camera',jobType:'Repair',customerName:'Test Customer',siteName:'Main Site',notes:[{body:'Replaced damaged connector and restored image.'}]};
  const draft=await generateReportDraft(job,{checklist:[{label:'System tested',checked:true}],equipment:[],engineerObservations:'Live view and playback checked.'});
  assert.match(draft.workSummary,/Replaced damaged connector/);assert.match(draft.workSummary,/System tested/);assert.match(draft.disclaimer,/assigned engineer must verify/i);
});
test('analytics SQL uses a non-keyword monthly-series alias',async()=>{
  const source=await readFile(new URL('../server/store.js',import.meta.url),'utf8');
  assert.match(source,/as month_start/);
  assert.doesNotMatch(source,/\) month\) select to_char\(s\.month/);
});

test('assistant recognises quotation requests and preserves the brief',()=>{
  const prompt='Prepare a quote for four external CCTV cameras and an NVR';
  assert.deepEqual(quoteIntentAction(prompt),{type:'quote_draft',brief:prompt});
  assert.equal(quoteIntentAction('Show engineer workload'),null);
});
