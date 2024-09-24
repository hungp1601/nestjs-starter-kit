import { Column, Entity, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Emojis, Backgrounds } from '../interfaces/conversation.interface';
import { BaseMysqlEntity } from '@/base/entities/base-mysql.entities';
import { UserEntity } from '@/user/entities/user.entity';
import { Message } from './message.entity';
import { UserConversation } from './user-conversation.entity';

@Entity({ name: 'conversations' })
export class Conversation extends BaseMysqlEntity {
  @Column({ name: 'title', nullable: true })
  title: string;

  @Column({ name: 'description', nullable: true, length: 5000 })
  description: string;

  @Column({ name: 'background', nullable: true, default: 'white' })
  background: Backgrounds;

  @Column({ name: 'emoji', nullable: true, default: 'white' })
  emoji: Emojis;

  @OneToMany(() => Message, (message) => message.conversation)
  messages?: Message[];

  @OneToMany(
    () => UserConversation,
    (userConversation) => userConversation.conversation,
  )
  userConversation?: UserConversation[];

  @ManyToMany(() => UserEntity, (users) => users.conversations)
  @JoinTable({
    name: 'user_conversation',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  users: UserEntity[];
}
