import type { UserStatus } from "../components/UserStatusBandage/UserStatusBandage";
import type { PublicProfile } from "../types";
import type { PlayerData } from "./PlayerDataType";

// Change the password
export async function updatePassword(currentPassword: string, newPassword: string) {
	const res = await fetch("/api/users/me/password", {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ currentPassword, newPassword }),
	});
	if (!res.ok) throw new Error("Failed to update password");
}

// Updates the profile image
export async function updateAvatar(picture: File) {
	const formData = new FormData();
	formData.append("file", picture);

	const res = await fetch("/api/users/me/avatar", {
		method: "POST",
		credentials: "include",
		body: formData,
	});

	if (!res.ok) throw new Error("Failed to update Avatar");
}

// Check if the username is available when we try to create a new account
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

// Function to sign up connecting to api
export async function signupUser(userData: Record<string, any>): Promise<boolean> {
	const response = await fetch("/api/auth/signup", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userData),
	});

	if (!response.ok) {
		throw new Error("Failed to sign up user.");
	}

	const data = await response.json();
	return data;
}

export async function updateUserName(username: string): Promise<boolean> {
	const response = await fetch("api/users/me/username", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username: username }),
	});

	if (!response.ok) {
		throw new Error("Failed to change userName.");
	}
	const data = await response.json();
	return data;
}

export async function updateEmail(email: string): Promise<boolean> {
	const response = await fetch("api/users/me/email", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: email }),
	});

	if (!response.ok) {
		throw new Error("Failed to change email.");
	}
	const data = await response.json();
	return data;
}

export async function updateBoardTheme(boardThemeVal: number): Promise<boolean> {
	let data;

	try {
		const response = await fetch("/api/users/me/board-theme", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ boardTheme: boardThemeVal }),
		});
		data = await response.json();
	} catch (error) {
		console.log(error);
		throw new Error("Failed to update board-theme.");
	}

	return data;
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

export async function updateBackGroundTheme(backgroundThemeVal: number): Promise<boolean> {
	let data;

	try {
		const response = await fetch("/api/users/me/background-theme", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ backgroundTheme: backgroundThemeVal }),
		});
		data = await response.json();
	} catch (error) {
		console.log(error);
		throw new Error("Failed to update background theme.");
	}

	return data;
}

// Calls the backend to get the best 10 players
export async function getLeaderboard(): Promise<PlayerData[]> {
	let data;

	try {
		const response = await fetch("/api/users/leaderboard", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (response.ok == false) {
			throw new Error(`Error HTTP: ${response.status}`);
		}

		data = await response.json();
	} catch (error) {
		console.log(error);
		throw new Error("Failed to fetch leaderboard data.");
	}

	return data;
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

export async function getUserStatus(userId: number): Promise<UserStatus> {
	try {
		const response = await fetch(`/api/presence/${userId}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed get User Status :", error);
		return "offline";
	}
}

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
		console.log("Good Response Notifications");
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
