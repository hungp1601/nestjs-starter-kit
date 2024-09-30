import { BaseMysqlEntity } from '@/base/entities/base-mysql.entities';
import { UserEntity } from '@/user/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity({ name: 'messages' })
export class Message extends BaseMysqlEntity {
  @Column({ name: 'conversation_id', nullable: true })
  conversation_id: string;

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @Column({ default: false })
  status: boolean;

  @Column({ name: 'message', length: 255 })
  message: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation?: Conversation;
}
