import { WebSocketServer } from "./src/server/web-socket-server";

const wsServer = new WebSocketServer(3000);
wsServer.start();

setInterval(() => {
  const message = {
    type: "ping",
    timestamp: new Date().toISOString(),
  };
  wsServer.sendToUser(1, message);
  console.log("📤 Sent ping message to user 1:", message);
  wsServer.sendToUser(3, message);
  console.log("📤 Sent ping message to user 3:", message);
}, 5000);
