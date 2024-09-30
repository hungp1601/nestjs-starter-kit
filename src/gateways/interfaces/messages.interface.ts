import { UserEntity } from '@/user/entities/user.entity';

export interface MessagesInterface {
  message: string;
  conversation_id: string;
  user_id: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  user: UserEntity;
}
