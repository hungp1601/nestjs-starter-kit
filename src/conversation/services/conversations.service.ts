import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../entities/conversation.entity';
import { BaseMysqlService } from '@/base/services/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationsService extends BaseMysqlService<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {
    super(conversationRepository);
  }

  async create(inputs: Conversation): Promise<Conversation> {
    return await this.createOne(inputs);
  }
}
