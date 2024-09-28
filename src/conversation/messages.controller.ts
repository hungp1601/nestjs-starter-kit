import {
  Get,
  Put,
  Post,
  Body,
  Delete,
  Param,
  Controller,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Message } from './entities/message.entity';
import { JwtAuthGuard } from '@/user/guards/jwt-auth/jwt-auth.guard';
import { MessagesService } from './services/messages.service';
import { ParamId } from '@/base/types/params-id';
import { MessageListParam } from './interfaces/message.interface';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @Get('/')
  async index(@Query() query: MessageListParam) {
    return this.messageService.findAllPaginate(
      query.conversation_id,
      query.take,
      query.page,
    );
  }

  @Get('/:id')
  async getById(@Param() params: ParamId) {
    const messageId = parseInt(params.id, 10);
    const message = await this.messageService.findOneById(messageId);
    this.throwMessageNotFound(message);
    return message;
  }

  @Post('/')
  async create(@Body() inputs: Message): Promise<Message> {
    return await this.messageService.create(inputs);
  }

  @Put('/:id')
  async update(@Param() params: ParamId, @Body() inputs: Message) {
    const messageId = parseInt(params.id, 10);
    return await this.messageService.updateOneById(messageId, inputs);
  }

  @Delete('/:id')
  async delete(@Param() params: ParamId) {
    const messageId = parseInt(params.id, 10);
    return await this.messageService.deleteOneById(messageId);
  }

  throwMessageNotFound(message: Message | null) {
    if (!message) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}
