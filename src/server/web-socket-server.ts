import { createServer, IncomingMessage } from 'http'
import { createHash } from 'crypto'
import { Socket } from 'net'
import { WebSocketConnection } from './web-socket-connection'
import { Duplex } from 'stream'
import { validateId } from '../../src/utils/id-validator'
import { CorsValidator } from '../../src/utils/cors-validator'

export class WebSocketServer {
  private server = createServer()
  private connections: Set<WebSocketConnection> = new Set()
  private corsValidator: CorsValidator = new CorsValidator()

  constructor(private port: number = 3000) {}

  public start(): void {
    this.server.on('upgrade', (req, socket) => this.handleUpgrade(req, socket))
    this.server.listen(this.port, () => {
      console.log(`✅ WebSocket server listening on ws://localhost:${this.port}`)
    })
  }

  private handleUpgrade(req: IncomingMessage, socket: Duplex): void {
    const key = req.headers['sec-websocket-key']
    const origin = req.headers['origin'] ?? null

    console.log('origin:' + origin)

    if (!this.corsValidator.isOriginAllowed(origin)) {
      console.warn(`❌ Connection attempt from disallowed origin: ${origin}`)
      socket.destroy()
      return
    }

    if (!key || typeof key !== 'string') {
      socket.destroy()
      return
    }

    const requestUrl = new URL(req.url || '/', `http://localhost:${this.port}`)
    const rawUserId = requestUrl.searchParams.get('userId')

    if (!rawUserId) {
      console.warn('❌ Connection attempt without userId. Rejecting.')
      socket.destroy()
      return
    }

    const userId = validateId(rawUserId)

    const acceptKey = createHash('sha1')
      .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64')

    socket.write(
      [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        '',
        ''
      ].join('\r\n')
    )

    console.log(`🔌 Client connected with ID: ${userId}`)

    const connection = new WebSocketConnection(socket as Socket, userId)
    this.connections.add(connection)
  }

  public broadcast(message: object): void {
    for (const connection of this.connections) {
      connection.send(message)
    }
  }

  public sendTo(connection: WebSocketConnection, message: object): void {
    if (this.connections.has(connection)) {
      connection.send(message)
    }
  }

  public sendToUser(userId: number, message: object): void {
    for (const connection of this.connections) {
      if (connection.userId === userId) {
        connection.send(message)
      }
    }
  }

  public sendToGroup(userIds: number[], message: object): void {
    for (const connection of this.connections) {
      if (userIds.includes(connection.userId)) {
        connection.send(message)
      }
    }
  }

  public getConnections(): WebSocketConnection[] {
    return Array.from(this.connections)
  }
}
