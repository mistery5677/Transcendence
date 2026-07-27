// Send the friend request for the targetUsername
export async function sendFriendRequest(targetUsername: string) {
	const token = localStorage.getItem("token");

	const response = await fetch("./api/FriendRequest/request", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			targetUsername: targetUsername,
		}),
	});

	// If we get a bad response from the data base
	if (response.ok == false) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Erro desconhecido ao adicionar amigo.");
	}

	return await response.json();
}

// Get all the pending requests
export async function getPendingFriendRequests() {
	const token = localStorage.getItem("token");

	const response = await fetch("./api/FriendRequest/pending", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) throw new Error("Failed to load the pending request.");
	return await response.json();
}

// Accept the friend request
export async function acceptFriendRequest(senderId: number) {
	const token = localStorage.getItem("token");
	const response = await fetch("./api/FriendRequest/accept", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ senderId: senderId }),
	});

	if (response.ok == false) throw new Error("Failed to accept the friend request");

	return await response.json();
}

// Decline the friend request
export async function declineFriendRequest(senderId: number) {
	const token = localStorage.getItem("token");
	const response = await fetch("./api/FriendRequest/decline", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ senderId: senderId }),
	});

	if (response.ok == false) throw new Error("Failed to decline the friend request");
	return await response.json();
}

// Get all friends
export async function getFriendsList() {
	const token = localStorage.getItem("token");
	const response = await fetch("./api/FriendRequest/list", {
		headers: { Authorization: `Bearer ${token}` },
	});
	return await response.json();
}

// Remove a frined
export async function removeFriend(friendId: number) {
	const token = localStorage.getItem("token");
	const response = await fetch("./api/FriendRequest/remove", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ friendId }),
	});
	return await response.json();
}
