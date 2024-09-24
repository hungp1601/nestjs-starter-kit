import {
  Get,
  Put,
  Post,
  Body,
  Delete,
  Param,
  Controller,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { Conversation } from './entities/conversation.entity';
import { ParamId } from '@/base/types/params-id';
import { JwtAuthGuard } from '@/user/guards/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationsService) {}

  @Get('/')
  async index() {
    return this.conversationService.findAll({
      join: ['users'],
    });
  }

  @Get('/:id')
  async getById(@Param() params: ParamId) {
    const Conversation = await this.conversationService.findOneById(
      parseInt(params.id, 10),
    );
    this.throwConversationNotFound(Conversation);
    return Conversation;
  }

  @Post('/')
  async create(@Body() inputs: Conversation) {
    return await this.conversationService.create(inputs);
  }

  @Put('/:id')
  async update(@Param() params: ParamId, @Body() inputs: Conversation) {
    const id = parseInt(params.id, 0);
    return await this.conversationService.updateOneById(id, inputs);
  }

  @Delete('/:id')
  async delete(@Param() params: ParamId) {
    const id = parseInt(params.id, 0);
    return await this.conversationService.deleteOneById(id);
  }

  @Get('socket/:id')
  async getDataInformation(@Param() params: ParamId): Promise<any> {
    const conversation = await this.conversationService.findOneById(
      parseInt(params.id, 10),
      {
        join: ['users'],
      },
    );

    const userId: number[] = [];
    conversation?.users?.map((user) => {
      userId.push(user.id);
      return user;
    });

    return userId;
  }

  throwConversationNotFound(Conversation: Conversation | null) {
    if (!Conversation) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}
