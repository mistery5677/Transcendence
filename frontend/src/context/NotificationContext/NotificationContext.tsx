import { useEffect, useState } from "react";
import { type NotificationType } from "./notificationTypes";
import { useGlobalSocket } from "../GlobalSocket/useGlobalSocket";
import {
	deleteAllNotifications,
	deleteOneNotification,
	getMyNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../../api/notificationsApi";
import { useAuth } from "../auth";
import { NotificationContext } from "./notificationContextValue";

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const { state } = useAuth();
	const [notifications, setNotifications] = useState<NotificationType[]>([]);
	const unreadCount = notifications.filter((n) => !n.read).length;

	useEffect(() => {
		const fetchNotifications = async () => {
			if (state.user) {
				const data = await getMyNotifications();
				setNotifications(data);
			}
		};
		fetchNotifications();
	}, [state.user]);

	useEffect(() => {
		if (!socket) return;

		const handleIncomingNotification = (newNotification: NotificationType) => {
			setNotifications((prev) => [newNotification, ...prev]);
		};

		socket.on("notification", handleIncomingNotification);
		return () => {
			socket.off("notification", handleIncomingNotification);
		};
	}, [socket]);

	const markOneAsRead = async (notificationId: string) => {
		setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
		await markNotificationAsRead(notificationId);
	};

	const markAllAsRead = async () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		await markAllNotificationsAsRead();
	};

	const deleteOne = async (notificationId: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
		await deleteOneNotification(notificationId);
	};
	const deleteAll = async () => {
		setNotifications([]);
		await deleteAllNotifications();
	};

	const clearNotifications = () => {
		setNotifications([]);
	};

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				markOneAsRead,
				markAllAsRead,
				clearNotifications,
				deleteOne,
				deleteAll,
			}}>
			{children}
		</NotificationContext.Provider>
	);
};
