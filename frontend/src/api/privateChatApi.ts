export async function getChatHistory(friendId: string | number): Promise<any[]> {
	const res = await fetch(`/api/chat/getHistory/${friendId}`, {
		method: "GET",
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error("Failed to fetch chat history");
	}

	return res.json();
}

export async function getActiveChats() {
	const res = await fetch("/api/chat/active_chats");
	if (!res.ok) {
		throw new Error("Failed to fetch active chats");
	}
	return res.json();
}
