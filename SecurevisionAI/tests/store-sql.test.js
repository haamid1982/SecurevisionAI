import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('job scheduling gives PostgreSQL explicit timestamp parameter types', async () => {
  const source = await readFile(new URL('../server/store.js', import.meta.url), 'utf8');
  const start = source.indexOf('async scheduleJob');
  const scheduleJob = source.slice(start, start + 3500);

  assert.match(scheduleJob, /scheduled_start=\$7::timestamptz/);
  assert.match(scheduleJob, /scheduled_end=\$8::timestamptz/);
  assert.match(scheduleJob, /\$7::timestamptz is not null/);
});

test('ordinary status changes cannot bypass the signed completion workflow', async () => {
  const source = await readFile(new URL('../server/store.js', import.meta.url), 'utf8');
  const start = source.indexOf('async updateJobStatus');
  const updateJobStatus = source.slice(start, start + 2800);

  assert.match(updateJobStatus, /if\(status==='Completed'\)throw/);
  assert.match(updateJobStatus, /status=\$2::job_status/);
  assert.doesNotMatch(updateJobStatus, /completed_at=case/);
});

test('document email delivery gives PostgreSQL an explicit status parameter type', async () => {
  const source = await readFile(new URL('../server/store.js', import.meta.url), 'utf8');
  const start = source.indexOf('async finishDelivery');
  const finishDelivery = source.slice(start, start + 900);

  assert.match(finishDelivery, /status=\$2::varchar/);
  assert.match(finishDelivery, /when \$2::varchar='Sent'/);
});

test('Windows PDF generation uses a project-owned writable temporary root', async () => {
  const source = await readFile(new URL('../server/pdf.js', import.meta.url), 'utf8');
  assert.match(source, /process\.platform==='win32'\?join\(process\.cwd\(\),'\.securevision-temp'\):tmpdir\(\)/);
  assert.match(source, /await mkdir\(pdfTempRoot,\{recursive:true\}\)/);
  assert.match(source, /pdfWorkingDirectory\('securevision-pdf-'\)/);
});
