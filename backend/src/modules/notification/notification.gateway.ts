import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeClients = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`WebSocket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`WebSocket client disconnected: ${client.id}`);
    this.activeClients.delete(client.id);
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.activeClients.set(client.id, userId);
    client.join(`user_${userId}`);
    return { status: 'registered' };
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }
}
