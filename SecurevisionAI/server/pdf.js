import {mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const defaultPython=process.platform==='win32'?'python':'python3';
const pdfTempRoot=process.env.PDF_TEMP_DIR|| (process.platform==='win32'?join(process.cwd(),'.securevision-temp'):tmpdir());

async function pdfWorkingDirectory(prefix){
  await mkdir(pdfTempRoot,{recursive:true});
  return mkdtemp(join(pdfTempRoot,prefix));
}

export async function renderBusinessPdf(data){
  const directory=await pdfWorkingDirectory('securevision-pdf-');
  const input=join(directory,'document.json'),output=join(directory,'document.pdf');
  try{
    if(data.logoBase64){
      const logo=join(directory,'company-logo');
      await writeFile(logo,Buffer.from(data.logoBase64,'base64'));
      data={...data,logo,logoBase64:undefined};
    }
    await writeFile(input,JSON.stringify(data),'utf8');
    await new Promise((resolve,reject)=>{const child=spawn(process.env.PDF_PYTHON_BIN||defaultPython,[join(here,'pdf','generate_document.py'),input,output]);let errors='';child.stderr.on('data',x=>errors+=x);child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(errors||`PDF generator exited with ${code}`)));});
    return await readFile(output);
  }finally{await rm(directory,{recursive:true,force:true});}
}

export async function renderServiceReportPdf(data){
  const directory=await pdfWorkingDirectory('securevision-report-');
  const input=join(directory,'report.json'),output=join(directory,'service-report.pdf');
  try{
    const assets={};
    if(data.logoBase64){assets.logo=join(directory,'logo');await writeFile(assets.logo,Buffer.from(data.logoBase64,'base64'))}
    if(data.signatureBase64){assets.signature=join(directory,'signature.png');await writeFile(assets.signature,Buffer.from(data.signatureBase64,'base64'))}
    assets.photos=[];
    for(let i=0;i<(data.photos||[]).length;i++){const path=join(directory,`photo-${i}`);await writeFile(path,Buffer.from(data.photos[i].dataBase64,'base64'));assets.photos.push(path)}
    await writeFile(input,JSON.stringify({...data,assets,logoBase64:undefined,signatureBase64:undefined,photos:(data.photos||[]).map(({caption,mime})=>({caption,mime}))}),'utf8');
    await new Promise((resolve,reject)=>{const child=spawn(process.env.PDF_PYTHON_BIN||defaultPython,[join(here,'pdf','generate_service_report.py'),input,output]);let errors='';child.stderr.on('data',x=>errors+=x);child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(errors||`Service report generator exited with ${code}`)));});
    return await readFile(output);
  }finally{await rm(directory,{recursive:true,force:true});}
}
