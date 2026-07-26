import { createContext, useContext, useEffect, useState } from "react";
import { type NotificationContextType, type NotificationType } from "./notificationTypes";
import { useGlobalSocket } from "../GlobalSocket/GlobalSocketContext";
import {
	deleteAllNotifications,
	deleteOneNotification,
	getMyNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../../api/notifications";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
	const { socket } = useGlobalSocket();
	const [notifications, setNotifications] = useState<NotificationType[]>([]);

	let unreadCount = notifications.filter((n) => !n.read).length;

	useEffect(() => {
		const fetchNotifications = async () => {
			const data = await getMyNotifications();
			setNotifications(data);
		};
		fetchNotifications();
		unreadCount = notifications.filter((n) => !n.read).length;
	}, []);

	useEffect(() => {
		if (!socket) return;

		const handleIncomingNotification = (newNotification: NotificationType) => {
			setNotifications((prev) => [newNotification, ...prev]);
		};

		unreadCount = notifications.filter((n) => !n.read).length;
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

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) throw new Error("useNotifications must use on NotificationProvider");
	return context;
};
