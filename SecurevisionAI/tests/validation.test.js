import test from 'node:test';
import assert from 'node:assert/strict';
import {accountInput,billingInput} from '../server/validation.js';
import {aiQuoteDraftInput,aiReportDraftInput,inventoryMovementInput,jobCompletionInput,quoteInput} from '../server/validation.js';

test('AI quotation requests require a customer and meaningful brief',()=>{
  assert.equal(aiQuoteDraftInput.safeParse({customerId:'not-a-uuid',brief:'short'}).success,false);
  assert.equal(aiQuoteDraftInput.safeParse({customerId:'0f0c8dd4-c57c-42f0-b128-f072866215f2',brief:'Supply and install four external CCTV cameras.'}).success,true);
});

test('quotation validation rejects negative prices and empty line items',()=>{
  const base={customerId:'0f0c8dd4-c57c-42f0-b128-f072866215f2',title:'CCTV installation',items:[]};
  assert.equal(quoteInput.safeParse(base).success,false);
  assert.equal(quoteInput.safeParse({...base,items:[{description:'Camera',quantity:1,unitPrice:-1}]}).success,false);
});

test('stock movements cannot be zero',()=>{
  assert.equal(inventoryMovementInput.safeParse({movementType:'Adjustment',quantityChange:0}).success,false);
  assert.equal(inventoryMovementInput.safeParse({movementType:'Received',quantityChange:4}).success,true);
});

test('completion and AI report payloads enforce evidence limits',()=>{
  const item={description:'IP camera',manufacturer:'Test',model:'C1',serialNumber:'ABC',quantity:1};
  assert.equal(aiReportDraftInput.safeParse({checklist:[{label:'System tested',checked:true}],equipment:[item],engineerObservations:'Images checked.'}).success,true);
  assert.equal(jobCompletionInput.safeParse({checklist:[],equipment:[],workSummary:'Done',furtherWorkRequired:'',customerName:'',customerSignature:null}).success,true);
});
test('settings account and billing inputs reject invalid values',()=>{
  assert.equal(accountInput.safeParse({fullName:'A'}).success,false);
  assert.equal(accountInput.safeParse({fullName:'Example User'}).success,true);
  assert.equal(billingInput.safeParse({plan:'Professional',billingEmail:'accounts@example.com',purchaseOrderReference:''}).success,true);
  assert.equal(billingInput.safeParse({plan:'Free',billingEmail:'not-an-email'}).success,false);
});
