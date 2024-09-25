import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseMysqlService } from '@/base/services/base.service';
import { Information } from '../entities/information.entity';
import { Repository } from 'typeorm';
import { TypeInformation } from '../interfaces/information.interface';

@Injectable()
export class InformationService extends BaseMysqlService<Information> {
  constructor(
    @InjectRepository(Information)
    private conversationRepository: Repository<Information>,
  ) {
    super(conversationRepository);
  }

  async create(inputs: Information): Promise<Information> {
    return await this.createOne(inputs);
  }

  async findSocketId(user_ids: number[]) {
    return await this.findAll({
      where: {
        and: [
          {
            user_id: {
              in: user_ids,
            },
          },
          { type: TypeInformation.socket_id },
        ],
      },
      select: ['value'],
    });
  }

  async deleteByValue(user_id: number | string, value: string) {
    return this.deleteOne({
      where: {
        and: [{ user_id }, { value }],
      },
    });
  }
}
