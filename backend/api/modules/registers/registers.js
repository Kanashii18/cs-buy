import cookie from '@fastify/cookie';
import multipart from "@fastify/multipart";
import staticFiles from '@fastify/static';
import routes_api from './routes_def';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function registers_api(fastify, db, io){
     await fastify.register(multipart,{
          limits:{
               fileSize: 10 * 1024 * 1024
          },
     });
     
     await fastify.register(staticFiles, {
          root: path.join(__dirname),
          prefix: '/robots.txt',
          decorateReply: false
     });
     
     // Register plugins
     fastify.register(cookie);
     await routes_api(fastify, db, io);
}