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
    return this.conversationService.findAll(['users']);
  }

  @Get('/:id')
  async getById(@Param() params: ParamId): Promise<Conversation> {
    const Conversation = await this.conversationService.findById(
      parseInt(params.id, 10),
    );
    this.throwConversationNotFound(Conversation);
    return Conversation;
  }

  @Post('/')
  async create(@Body() inputs: Conversation): Promise<Conversation> {
    return await this.conversationService.create(inputs);
  }

  @Put('/:id')
  async update(
    @Param() params: ParamId,
    @Body() inputs: Conversation,
  ): Promise<Conversation> {
    const Conversation = await this.conversationService.findById(
      parseInt(params.id, 0),
    );
    this.throwConversationNotFound(Conversation);
    return await this.conversationService.update(Conversation, inputs);
  }

  @Delete('/:id')
  async delete(@Param() params: ParamId): Promise<boolean> {
    const Conversation = await this.conversationService.findById(
      parseInt(params.id, 0),
    );
    this.throwConversationNotFound(Conversation);
    return await this.conversationService.deleteById(parseInt(params.id, 10));
  }

  @Get('socket/:id')
  async getDataInformation(@Param() params: ParamId): Promise<any> {
    const conversation = await this.conversationService.findById(
      parseInt(params.id, 10),
      ['users'],
    );

    const userId = [];
    conversation.users.map((user) => {
      userId.push(user.id);
      return user;
    });

    return userId;
  }

  throwConversationNotFound(Conversation: Conversation) {
    if (!Conversation) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}
