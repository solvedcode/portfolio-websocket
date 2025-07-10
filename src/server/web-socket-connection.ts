import { Socket } from 'net'
import { decodeWebSocketFrame } from '../utils/web-socket-decoder'
import { encodeWebSocketFrame } from '../utils/web-socket-encoder'

export class WebSocketConnection {
  private closeListeners: (() => void)[] = []

  constructor(
    private socket: Socket,
    public userId: number | null
  ) {
    this.listen()
  }

  private listen(): void {
    this.socket.on('data', buffer => {
      try {
        const rawMessage = decodeWebSocketFrame(buffer)
        const message = JSON.parse(rawMessage)
        console.log('📩 Received:', message)

        const response = encodeWebSocketFrame(
          JSON.stringify({
            type: 'echo',
            original: message
          })
        )
        this.socket.write(response)
      } catch (err) {
        console.error('❌ Frame handling error:', err)
      }
    })

    this.socket.on('close', () => {
      console.log('🔌 Client disconnected')
    })

    this.socket.on('error', err => {
      console.error('❌ Socket error:', err.message)
    })
  }

  public send(message: object): void {
    const payload = JSON.stringify(message)
    const frame = encodeWebSocketFrame(payload)
    this.socket.write(frame)
  }

  public onClose(callback: () => void): void {
    this.closeListeners.push(callback)
  }
}
