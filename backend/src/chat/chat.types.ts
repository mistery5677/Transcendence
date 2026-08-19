export interface ActiveChatSummary {
  id: string;
  status: string;
  username: string;
  avatarUrl: string | null;
  lastMessage: {
    message: string;
    timestamp: string;
    fromId: string;
    toId: string;
  };
  timestamp: string;
}