import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {attachGameWebSocketServer} from './game.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const port=Number(process.env.PORT)||3001;
const mimeTypes={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.ico':'image/x-icon','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};

const server=createServer(async(req,res)=>{
 const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
 if(req.method==='GET'&&url.pathname==='/api/health'){
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify({status:'ok'}));
  return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Method not allowed');return}
 let requested;
 try{requested=decodeURIComponent(url.pathname)}
 catch{res.writeHead(400);res.end('Invalid URL path');return}
 let file=path.resolve(dist,`.${requested}`);
 if(file!==dist&&!file.startsWith(`${dist}${path.sep}`)){res.writeHead(403);res.end('Forbidden');return}
 try{
  const info=await stat(file);
  if(info.isDirectory())file=path.join(file,'index.html');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':mimeTypes[path.extname(file)]||'application/octet-stream','Cache-Control':file.endsWith('index.html')?'no-cache':'public, max-age=3600'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch(error){
  if(error.code!=='ENOENT'&&error.code!=='ENOTDIR'){res.writeHead(500);res.end('Unable to serve the requested file');return}
  try{
   const body=await readFile(path.join(dist,'index.html'));
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
   res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8'});res.end('Build the app with npm run build before starting the production server.')}
 }
});

attachGameWebSocketServer(server,'/ws');
server.listen(port,'0.0.0.0',()=>process.stdout.write(`KIM POOL server listening on port ${port}\n`));
server.on('error',error=>{process.stderr.write(`KIM POOL server failed: ${error.message}\n`);process.exitCode=1});
