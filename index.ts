import { WebSocketServer } from './src/server/web-socket-server'

export const wsServer = new WebSocketServer(8000)
wsServer.start()
