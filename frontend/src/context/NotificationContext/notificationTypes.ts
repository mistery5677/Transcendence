export type NotificationPayload = {
	senderId?: string | number;
	senderUsername?: string;
	senderAvatarUrl?: string | null;
	action?: string;
};

export type NotificationType = {
	id: string;
	title: string;
	message: string;
	type: "matchInvite" | "system" | "friendRequest";
	read: boolean;
	createdAt: string;
	payload?: NotificationPayload;
};

export type NotificationContextType = {
	notifications: NotificationType[];
	unreadCount: number;
	markOneAsRead: (notificationId: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	deleteOne: (notificationId: string) => Promise<void>;
	deleteAll: () => Promise<void>;
	clearNotifications: () => void;
};
