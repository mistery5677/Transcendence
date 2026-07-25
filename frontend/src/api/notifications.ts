export async function getMyNotifications(): Promise<any[]> {
	try {
		const response = await fetch("/api/notification", {
			method: "GET",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Failed to load notifications:", error);
		return [];
	}
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
	try {
		const response = await fetch("/api/notification/read-all", {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to mark notifications as read on backend:", error);
		return false;
	}
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
	try {
		const response = await fetch(`/api/notification/read/${notificationId}`, {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});
		return response.ok;
	} catch (error) {
		console.error("Failed to mark notification as read:", error);
		return false;
	}
}

export async function deleteOneNotification(notificationId: string): Promise<boolean> {
	try {
		const response = await fetch(`/api/notification/delete/${notificationId}`, {
			method: "DELETE",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});
		return response.ok;
	} catch (error) {
		console.error("Failed to delete one notification on backend:", error);
		return false;
	}
}

export async function deleteAllNotifications(): Promise<boolean> {
	try {
		const response = await fetch("/api/notification/delete-all", {
			method: "DELETE",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to delete notifications on backend:", error);
		return false;
	}
}
