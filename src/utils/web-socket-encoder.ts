export function encodeWebSocketFrame(data: string): Buffer {
  const json = Buffer.from(data)
  const frame = [129, json.length] // 129 = 10000001 (FIN = 1, opcode = 1)
  return Buffer.concat([Buffer.from(frame), json])
}
