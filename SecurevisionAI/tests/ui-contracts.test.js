import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appPagesPath = new URL('../src/app-pages.jsx', import.meta.url);
const mainPath = new URL('../src/main.jsx', import.meta.url);
const schedulePath = new URL('../src/live-schedule.jsx', import.meta.url);
const appStylesPath = new URL('../src/app-styles.css', import.meta.url);

test('shared application buttons forward disabled state and additional attributes', async () => {
  const source = await readFile(appPagesPath, 'utf8');

  assert.match(source, /export const Button=.*disabled=false.*\.\.\.props/);
  assert.match(source, /disabled=\{disabled\} \{\.\.\.props\}/);
});

test('customers and jobs do not initialise with fictional records', async () => {
  const source = await readFile(appPagesPath, 'utf8');

  assert.match(source, /const customers=\[\];/);
  assert.match(source, /const jobs=\[\];/);
  assert.match(source, /useState\(customers\)/);
  assert.match(source, /useState\(jobs\)/);
});

test('mobile public navigation exposes authentication links', async () => {
  const source = await readFile(mainPath, 'utf8');

  assert.match(source, /mobile-auth-links/);
  assert.match(source, /to="\/login"[^>]*>.*Login<\/Link>/);
  assert.match(source, /to="\/forgot-password"[^>]*>.*Forgot Password<\/Link>/);
});

test('settings only exposes functional profile, account, permissions and billing tabs', async () => {
  const source = await readFile(appPagesPath, 'utf8');
  const settings = source.slice(source.indexOf('export function CompanySettings'),source.indexOf('export function TeamManagement'));

  assert.match(settings, /Company Profile/);
  assert.match(settings, /My Account/);
  assert.match(settings, /Roles & Permissions/);
  assert.match(settings, /Billing/);
  assert.doesNotMatch(settings, /Integrations|\['Bell','Notifications'\]|\['ShieldCheck','Security'\]/);
  assert.match(settings, /api\.account\.update/);
  assert.match(settings, /api\.billing\.update/);
  assert.match(settings, /api\.team\.update/);
});

test('assistant quotation action carries its brief into the quote generator',async()=>{
  const appSource=await readFile(appPagesPath,'utf8');
  const quoteSource=await readFile(new URL('../src/ai-quote.jsx',import.meta.url),'utf8');
  assert.match(appSource,/Continue to Editable Quote Draft/);
  assert.match(appSource,/encodeURIComponent\(message\.action\.brief\)/);
  assert.match(quoteSource,/searchParams\.get\('brief'\)/);
});

test('administrator job status keeps Completed visible and opens the completion workflow',async()=>{
  const source=await readFile(appPagesPath,'utf8');
  const workspace=source.slice(source.indexOf('export function JobWorkspace'),source.indexOf('export function LiveQuotes'));
  assert.match(workspace, /<option>Completed<\/option>/);
  assert.match(workspace, /value==='Completed'/);
  assert.match(workspace, /scrollIntoView/);
  assert.match(workspace, /<CompletionWorkspace job=\{job\}/);
});

test('every quotation exposes a database-backed edit workflow',async()=>{
  const source=await readFile(appPagesPath,'utf8');
  assert.match(source,/api\.quotes\.get\(row\.id\)/);
  assert.match(source,/<I\.Pencil size=\{15\}\/>Edit/);
  assert.match(source,/function EditQuoteModal/);
  assert.match(source,/api\.quotes\.update\(quote\.id,data\)/);
});

test('customer list exposes a populated database-backed edit form',async()=>{
  const source=await readFile(appPagesPath,'utf8');
  const customers=source.slice(source.indexOf('export function Customers'),source.indexOf('const jobs=[]'));
  assert.match(customers,/api\.customers\.get\(id\)/);
  assert.match(customers,/api\.customers\.update\(editing\.id,data\)/);
  assert.match(customers,/<I\.Pencil size=\{15\}\/>Edit/);
  assert.match(source,/function CustomerModal\(\{customer=null,onClose,onSave\}\)/);
});

test('schedule shows seven days and excludes closed work',async()=>{
  const source=await readFile(schedulePath,'utf8');
  assert.match(source,/Array\.from\(\{length:7\}/);
  assert.match(source,/days\[6\]\.toLocaleDateString/);
  assert.match(source,/!\['Completed','Cancelled'\]\.includes\(job\.status\)/);
});

test('application navigation scrolls independently on short screens',async()=>{
  const source=await readFile(appStylesPath,'utf8');
  assert.match(source,/\.app-side nav\{[^}]*flex:1 1 auto[^}]*overflow-y:auto/);
  assert.match(source,/\.live-cal-head,\.live-cal-row\{grid-template-columns:190px repeat\(7,/);
});

test('public website provides privacy and reversible cookie choices',async()=>{
  const source=await readFile(mainPath,'utf8');
  assert.match(source,/function CookiePolicy\(/);
  assert.match(source,/path="\/cookies" element=\{<CookiePolicy\/>\}/);
  assert.match(source,/securevision_cookie_consent_v1/);
  assert.match(source,/Reject optional cookies/);
  assert.match(source,/Accept optional cookies/);
  assert.match(source,/Cookie Settings/);
  assert.match(source,/Optional analytics and advertising cookies are not currently active/);
});

test('scheduling controls use visible whole-hour date and time selection',async()=>{
  const appSource=await readFile(appPagesPath,'utf8');
  const styleSource=await readFile(appStylesPath,'utf8');
  assert.match(appSource,/className='rounded-date-time'/);
  assert.match(appSource,/scheduleTimes\.forEach/);
  assert.match(appSource,/\?\'11:00\':\'09:00\'/);
  assert.match(appSource,/MutationObserver/);
  assert.match(styleSource,/calendar-picker-indicator/);
  assert.match(styleSource,/filter:invert\(1\) brightness\(2\)/);
  assert.match(styleSource,/color-scheme:dark/);
  assert.match(styleSource,/input\[data-rounded-schedule="true"\]\{display:none!important\}/);
});
