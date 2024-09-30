import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './services/conversations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Information } from './entities/information.entity';
import { Message } from './entities/message.entity';
import { UserConversation } from './entities/user-conversation.entity';
import { InformationController } from './information.controller';
import { MessagesController } from './messages.controller';
import { UserConversationController } from './user-conversation.controller';
import { InformationService } from './services/information.service';
import { MessagesService } from './services/messages.service';
import { UserConversationService } from './services/user-conversation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      UserConversation,
      Information,
    ]),
  ],
  controllers: [
    ConversationsController,
    InformationController,
    MessagesController,
    UserConversationController,
  ],
  providers: [
    ConversationsService,
    InformationService,
    MessagesService,
    UserConversationService,
  ],
  exports: [
    ConversationsService,
    InformationService,
    MessagesService,
    UserConversationService,
  ],
})
export class ConversationsModule {}
