import { UserEntity } from '@/user/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { BaseMysqlEntity } from '@/base/entities/base-mysql.entities';

@Entity({ name: 'user_conversation' })
export class UserConversation extends BaseMysqlEntity {
  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @Column({ name: 'conversation_id', nullable: true })
  conversation_id: number;

  @Column({ name: 'last_message_id', nullable: true })
  last_message_id: number;

  @Column({ name: 'mute', default: false })
  mute: boolean;

  @Column({ name: 'block', default: false })
  block: boolean;

  @ManyToOne(() => UserEntity, (user) => user.userConversation)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(
    () => Conversation,
    (conversation) => conversation.userConversation,
  )
  @JoinColumn({ name: 'conversation_id' })
  conversation?: Conversation;
}
