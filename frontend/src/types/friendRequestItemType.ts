export type FriendRequestItem = {
	id: number;
	senderId: number;
	receiverId: number;
	status: string;
	createdAt: string;
	sender: {
		username: string;
		avatarUrl?: string | null;
	};
};
