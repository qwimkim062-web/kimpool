import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const children=[
 spawn(process.execPath,[path.join(root,'server','index.js')],{cwd:root,stdio:'inherit',env:process.env}),
 spawn(process.execPath,[path.join(root,'node_modules','vite','bin','vite.js'),'--host','0.0.0.0'],{cwd:root,stdio:'inherit',env:process.env})
];
let stopping=false;

function stop(signal,exitCode=0){
 if(stopping)return;
 stopping=true;
 process.exitCode=exitCode;
 for(const child of children){
  if(child.exitCode===null&&!child.killed)child.kill(signal);
 }
}

for(const child of children){
 child.on('error',error=>{
  process.stderr.write(`Unable to start a development service: ${error.message}\n`);
  stop('SIGTERM',1);
 });
 child.on('exit',(code,signal)=>{
  if(!stopping)stop('SIGTERM',code||signal?1:0);
 });
}

process.on('SIGINT',()=>stop('SIGINT'));
process.on('SIGTERM',()=>stop('SIGTERM'));
