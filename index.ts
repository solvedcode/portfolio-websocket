import { WebSocketServer } from "./src/server/web-socket-server";

export const wsServer = new WebSocketServer(3000);
wsServer.start();
