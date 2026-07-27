import type { PublicProfile, PlayerData } from "../types";

export async function verifyUsername(username: string): Promise<boolean> {
	const response = await fetch(`/api/users/check-username?username=${username}`);
	if (!response.ok) {
		throw new Error("Failed to check username");
	}
	const data = await response.json();
	return data.isAvailable;
}

// Check if the email is available when we try to create a new account
export async function verifyEmail(email: string): Promise<boolean> {
	const response = await fetch(`/api/users/check-email?email=${email}`);

	if (!response.ok) {
		throw new Error("Failed to verify email");
	}

	const data = await response.json();
	return data.isAvailable;
}



export async function getOpponentData(opponentId: string): Promise<PlayerData | null> {
	const res = await fetch(`/api/users/opponent/${opponentId}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
	if (!res.ok) {
		throw new Error("Failed to fetch OpponentUser.");
	}

	const opponent: PlayerData = await res.json();

	return opponent;
}

// Get users by username substring (for suggestions)
export async function getUsers(
	username: string,
	ignoreIds: number[] = [],
): Promise<{ id: number; username: string; avatarUrl?: string; score: { elo: number } }[]> {
	const res = await fetch(`/api/users/search?username=${encodeURIComponent(username)}`);
	if (!res.ok) throw new Error("Failed to fetch users");
	let users = await res.json();
	if (ignoreIds.length > 0) {
		users = users.filter((user: { id: number }) => !ignoreIds.includes(user.id));
	}
	return users;
}

export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
	const res = await fetch(`/api/users/profile/${username}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
	if (!res.ok) {
		throw new Error("Failed to fetch public profile.");
	}

	const profile: PublicProfile = await res.json();

	return profile;
}

export async function getMyAchievements(): Promise<string[]> {
	try {
		const response = await fetch("/api/users/achievements", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to load achievements :", error);
		return [];
	}
}



