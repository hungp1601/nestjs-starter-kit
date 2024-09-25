import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseMysqlService } from '@/base/services/base.service';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Pagination } from '../pagination';

@Injectable()
export class MessagesService extends BaseMysqlService<Message> {
  constructor(
    @InjectRepository(Message)
    private conversationRepository: Repository<Message>,
  ) {
    super(conversationRepository);
  }

  async create(inputs: Message): Promise<Message> {
    return await this.createOne(inputs);
  }

  async findAllPaginate(
    conversation_id: number | string,
    take: number | null,
    page: number | null,
    relations: string[] = [],
  ) {
    const takeRecord = take || 30;
    const paginate = page || 1;
    const skip = (paginate - 1) * takeRecord;
    const [results, total] = await this.conversationRepository.findAndCount({
      where: { conversation_id: Number(conversation_id) },
      order: { id: 'DESC' },
      relations,
      take: takeRecord,
      skip: skip,
    });

    return new Pagination<Message>({
      results,
      total,
    });
  }
}
