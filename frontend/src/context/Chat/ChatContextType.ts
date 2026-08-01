export type PrivateMessage = {
	fromId: string;
	toId: string;
	fromUsername: string;
	fromAvatarUrl: string;
	message: string;
	timestamp: string;
};

export type ChatContextType = {
	privateChats: Record<string, PrivateMessage[]>;
	sendPrivateMessage: (recipientId: string, text: string) => void;
	activeChatUserId: string | null;
	setActiveChatUserId: (userId: string | null) => void;
	loadChatHistory: (friendId: string) => Promise<void>;
	newMessage: boolean;
	setNewMessage: React.Dispatch<React.SetStateAction<boolean>>;
};
