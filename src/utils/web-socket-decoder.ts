export function decodeWebSocketFrame(buffer: Buffer): string {
  const secondByte = buffer[1]
  const length = secondByte & 127 // obtiene la longitud del payload
  const mask = buffer.slice(2, 6) // los siguientes 4 bytes son la máscara
  const data = buffer.slice(6, 6 + length) // datos encriptados

  const decoded = Buffer.alloc(length)

  for (let i = 0; i < length; i++) {
    decoded[i] = data[i] ^ mask[i % 4] // descifra con XOR
  }

  return decoded.toString('utf8')
}
