import {createServer} from 'node:http';
import {attachGameWebSocketServer} from '../server/game.js';

const server=createServer();
attachGameWebSocketServer(server);

export const config={maxDuration:300};
export default server;
