import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../entities/conversation.entity';
import { BaseMysqlService } from '@/base/services/base.service';

@Injectable()
export class ConversationsService extends BaseMysqlService<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Conversation,
  ) {
    super(conversationRepository);
  }

  async findAll(
    relations: string[] = [],
    throwsException = false,
  ): Promise<Conversation[]> {
    return await this.conversationRepository.getAllEntity(
      relations,
      throwsException,
    );
  }

  async create(inputs: Conversation): Promise<Conversation> {
    return await this.conversationRepository.createEntity(inputs);
  }

  async findById(
    id: number,
    relations: string[] = [],
    throwsException = false,
  ): Promise<Conversation> {
    return await this.conversationRepository.getEntityById(
      id,
      relations,
      throwsException,
    );
  }

  async update(
    conversation: Conversation,
    inputs: Conversation,
  ): Promise<Conversation> {
    return await this.conversationRepository.updateEntity(conversation, inputs);
  }

  async deleteById(id: number): Promise<boolean> {
    return await this.conversationRepository.deleteEntityById(id);
  }
}
