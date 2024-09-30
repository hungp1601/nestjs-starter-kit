export interface IUserConversation {
  id: string;
  user_id: string | null;
  conversation_id: number | null;
  mute: boolean;
  block: boolean;
  last_message_id: number | null;
}

export interface UpdateLastMessage {
  user_id: string;
  conversation_id: string;
  message_id: string;
}
