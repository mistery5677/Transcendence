import { useContext } from "react";
import { NotificationContext } from "./notificationContextValue";

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error("useNotifications must use on NotificationProvider");
	}
	return context;
}
