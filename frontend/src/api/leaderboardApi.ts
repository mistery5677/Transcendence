import type { PlayerData } from "../types/playerDataType";

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