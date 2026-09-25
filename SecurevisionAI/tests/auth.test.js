import test from 'node:test';
import assert from 'node:assert/strict';
import {allowRoles} from '../server/auth.js';

const response=()=>({statusCode:200,body:null,status(code){this.statusCode=code;return this},json(body){this.body=body;return this}});

test('administrator-only middleware permits administrators',()=>{
  let called=false;allowRoles('admin')({user:{role:'admin'}},response(),()=>{called=true});assert.equal(called,true);
});

test('administrator-only middleware rejects engineers',()=>{
  const res=response();let called=false;allowRoles('admin')({user:{role:'engineer'}},res,()=>{called=true});assert.equal(called,false);assert.equal(res.statusCode,403);assert.equal(res.body.error.code,'FORBIDDEN');
});

test('shared job middleware permits only declared roles',()=>{
  let engineer=false,customer=false;allowRoles('admin','engineer')({user:{role:'engineer'}},response(),()=>{engineer=true});allowRoles('admin','engineer')({user:{role:'customer'}},response(),()=>{customer=true});assert.equal(engineer,true);assert.equal(customer,false);
});
