export interface IMessage {
  id: number | string;
  user_id: string | null;
  conversation_id: number | null;
  status: boolean;
  message: string | null;
}

export interface MessageListParam {
  conversation_id: string | string;
  take: number | null;
  page: number | null;
}

export interface CreateMessage {
  user_id: string | null;
  conversation_id: string | null;
  status: boolean;
  message: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
