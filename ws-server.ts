import { createServer } from "http";
import { createHash } from "crypto";

const server = createServer();

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");

  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "",
      "",
    ].join("\r\n")
  );

  console.log("🔌 Client connected");

  // Error handler para evitar que el servidor se caiga
  socket.on("error", (err) => {
    console.error("❌ Socket error:", err.message);
  });

  socket.on("data", (buffer) => {
    try {
      const message = decodeWebSocketFrame(buffer);
      console.log("📩 Received:", message);

      const response = encodeWebSocketFrame(`Echo: ${message}`);
      socket.write(response);
    } catch (err) {
      console.error("❌ Frame handling error:", err);
    }
  });

  socket.on("close", () => {
    console.log("🔌 Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("✅ WebSocket server listening on ws://localhost:3000");
});

function decodeWebSocketFrame(buffer: Buffer): string {
  const secondByte = buffer[1];
  const length = secondByte & 127;
  const mask = buffer.slice(2, 6);
  const data = buffer.slice(6, 6 + length);
  const decoded = Buffer.alloc(length);

  for (let i = 0; i < length; i++) {
    decoded[i] = data[i] ^ mask[i % 4];
  }

  return decoded.toString("utf8");
}

function encodeWebSocketFrame(data: string): Buffer {
  const json = Buffer.from(data);
  const frame = [129, json.length];
  return Buffer.concat([Buffer.from(frame), json]);
}
