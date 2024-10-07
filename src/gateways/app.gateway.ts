import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from './guards/validation';
import { MessagesInterface } from './interfaces/messages.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/services/user/user.service';
import { ConversationsService } from '@/conversation/services/conversations.service';
import { TypeInformation } from '@/conversation/interfaces/information.interface';
import { InformationService } from '@/conversation/services/information.service';
import { MessagesService } from '@/conversation/services/messages.service';
import { UserConversationService } from '@/conversation/services/user-conversation.service';

@UseGuards(WsGuard)
@WebSocketGateway(3006, {
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('MessageGateway');
  constructor(
    private userService: UserService,
    private conversationService: ConversationsService,
    private informationService: InformationService,
    private messageService: MessagesService,
    private userConversationService: UserConversationService,
    private jwtService: JwtService,
  ) {}

  afterInit(server: any): any {
    this.logger.log(server, 'Init');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(client.id, 'Connected..............................');
      const user = await this.getDataUserFromToken(client);

      await this.informationService.createOne({
        user_id: user?.id,
        type: TypeInformation.socket_id,
        status: false,
        value: client.id,
      });
      // need handle insert socketId to information table
      // client.on('room', (room) => {
      //   client.join(room);
      // });
    } catch (e) {
      console.log(e);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = await this.getDataUserFromToken(client);
      await this.informationService.deleteByValue(user!.id, client.id);

      // need handle remove socketId to information table
      this.logger.log(client.id, 'Disconnect');
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('messages')
  async messages(client: Socket, payload: MessagesInterface) {
    const conversation = await this.conversationService.findOneById(
      payload.conversation_id,
      {
        join: ['users'],
      },
    );

    const userId: any[] = [];
    conversation?.users?.map((user: { id: any }) => {
      userId.push(user.id);

      return user;
    });

    const dataSocketId = await this.informationService.findSocketId(userId);

    const message = await this.messageService.createOne({
      user_id: payload.user_id,
      status: false,
      message: payload.message,
      conversation_id: payload.conversation_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const dataUserConversation =
      await this.userConversationService.findDataUserConversation(
        message.user_id,
        message.conversation_id,
      );

    const messageId = message.id;

    await this.userConversationService.updateLastMessageId(
      dataUserConversation!,
      messageId,
    );

    const emit = this.server;
    dataSocketId.map((value: { value: string | string[] }) => {
      emit.to(value.value).emit('message-received', {
        id: message.id,
        message: message.message,
        conversation_id: message.conversation_id,
        user_id: message.user_id,
        status: message.status,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
      });
    });

    //https://stackoverflow.com/questions/35680565/sending-message-to-specific-client-in-socket-io
    // // sending to sender-client only
    // socket.emit('message', "this is a test");
    //
    // // sending to all clients, include sender
    // io.emit('message', "this is a test");
    //
    // // sending to all clients except sender
    // socket.broadcast.emit('message', "this is a test");
    //
    // // sending to all clients in 'game' room(channel) except sender
    // socket.broadcast.to('game').emit('message', 'nice game');
    //
    // // sending to all clients in 'game' room(channel), include sender
    // io.in('game').emit('message', 'cool game');
    //
    // // sending to sender client, only if they are in 'game' room(channel)
    // socket.to('game').emit('message', 'enjoy the game');
    //
    // // sending to all clients in namespace 'myNamespace', include sender
    // io.of('myNamespace').emit('message', 'gg');
    //
    // // sending to individual socketid
    // socket.broadcast.to(socketid).emit('message', 'for your eyes only');

    //https://stackoverflow.com/questions/50602359/how-to-send-multiple-client-using-socket-id-that-are-connected-to-socket-nodejs
    // Add socket to room
    // socket.join('some room');
    //
    // // Remove socket from room
    //     socket.leave('some room');
    //
    // // Send to current client
    //     socket.emit('message', 'this is a test');
    //
    // // Send to all clients include sender
    //     io.sockets.emit('message', 'this is a test');
    //
    // // Send to all clients except sender
    //     socket.broadcast.emit('message', 'this is a test');
    //
    // // Send to all clients in 'game' room(channel) except sender
    //     socket.broadcast.to('game').emit('message', 'this is a test');
    //
    // // Send to all clients in 'game' room(channel) include sender
    //     io.sockets.in('game').emit('message', 'this is a test');
    //
    // // Send to individual socket id
    //     io.sockets.socket(socketId).emit('message', 'this is a test');
  }

  async getDataUserFromToken(client: Socket) {
    const authToken: any = client.handshake?.query?.token;
    try {
      if (!authToken || authToken === 'null') {
        return null;
      }
      const decoded = this.jwtService.verify(authToken);

      return await this.userService.isUserExists(decoded.email); // response to function
    } catch (ex) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}
