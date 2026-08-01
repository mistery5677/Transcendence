import type { Friend } from "../types/FriendType";

// Send the friend request for the targetUsername
export async function sendFriendRequest(targetUsername: string) {
	const response = await fetch("/api/FriendRequest/request", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			targetUsername: targetUsername,
		}),
	});

	// If we get a bad response from the data base
	if (response.ok == false) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Unknown  error adding a new friend.");
	}

	return await response.json();
}

// Get all the pending requests
export async function getPendingFriendRequests() {
	const response = await fetch("/api/FriendRequest/pending", {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) throw new Error("Failed to load the pending request.");
	return await response.json();
}

// Accept the friend request
export async function acceptFriendRequest(senderId: number) {
	const response = await fetch("/api/FriendRequest/accept", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ senderId: senderId }),
	});

	if (response.ok == false) throw new Error("Failed to accept the friend request");

	return await response.json();
}

// Decline the friend request
export async function declineFriendRequest(senderId: number) {
	const response = await fetch("/api/FriendRequest/decline", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ senderId: senderId }),
	});

	if (response.ok == false) throw new Error("Failed to decline the friend request");
	return await response.json();
}

// Get all friends
export async function getFriendsList(): Promise<Friend[]> {
	const response = await fetch("/api/FriendRequest/list", {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	return await response.json();
}

// Remove a friend
export async function removeFriend(friendId: number) {
	const response = await fetch("/api/FriendRequest/remove", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ friendId }),
	});
	return await response.json();
}
