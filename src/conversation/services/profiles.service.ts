import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseMysqlService } from '@/base/services/base.service';
import { Repository } from 'typeorm';
import { Profile } from '@/user/entities/profile.entity';

@Injectable()
export class ProfilesService extends BaseMysqlService<Profile> {
  constructor(
    @InjectRepository(Profile)
    private conversationRepository: Repository<Profile>,
  ) {
    super(conversationRepository);
  }

  async create(inputs: Profile): Promise<Profile> {
    return await this.createOne(inputs);
  }
}
