import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseMysqlService } from '@/base/services/base.service';
import { Repository } from 'typeorm';
import { UserConversation } from '../entities/user-conversation.entity';

@Injectable()
export class UserConversationService extends BaseMysqlService<UserConversation> {
  constructor(
    @InjectRepository(UserConversation)
    private conversationRepository: Repository<UserConversation>,
  ) {
    super(conversationRepository);
  }

  async create(inputs: UserConversation): Promise<UserConversation> {
    return await this.createOne(inputs);
  }

  async updateLastMessageId(
    entity: UserConversation | null,
    last_messages_id: number,
    relations: string[] = [],
  ) {
    if (!entity) {
      return new NotFoundException('Model not found');
    }
    return await this.updateOneById(entity.id, {
      ...entity,
      last_message_id: last_messages_id,
    })
      .then(async () => {
        return await this.findOneById((entity as any).id, {
          join: relations,
        });
      })
      .catch((error) => Promise.reject(error));
  }

  async findDataUserConversation(
    user_id: number,
    conversation_id: number,
  ): Promise<UserConversation | null> {
    return this.findOne({
      where: {
        and: [{ user_id }, { conversation_id }],
      },
    }).then((entity) => {
      if (!entity) {
        return Promise.reject(new NotFoundException('Model not found'));
      }

      return Promise.resolve(entity ? entity : null);
    });
  }
}
