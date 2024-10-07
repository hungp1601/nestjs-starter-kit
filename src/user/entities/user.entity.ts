import { Conversation } from '@/conversation/entities/conversation.entity';
import { Information } from '@/conversation/entities/information.entity';
import { Message } from '@/conversation/entities/message.entity';
import { Profile } from '@/user/entities/profile.entity';
import { UserConversation } from '@/conversation/entities/user-conversation.entity';
import { Exclude } from 'class-transformer';
import { BaseMysqlEntity } from 'src/base/entities/base-mysql.entities';
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class UserEntity extends BaseMysqlEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(
    () => UserConversation,
    (userConversation) => userConversation.user,
  )
  userConversation?: UserConversation[];

  @OneToMany(() => Message, (message) => message.user)
  messages?: Message[];

  @OneToMany(() => Information, (information) => information.user, {
    eager: true,
  })
  information?: Information[];

  @ManyToMany(() => Conversation, (conversations) => conversations.users)
  @JoinTable({
    name: 'user_conversation',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
  })
  conversations: Conversation[];
}
