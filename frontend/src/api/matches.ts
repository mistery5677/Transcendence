export async function handleGameOver(playerAId: number, playerBId: number, matchResult: string) {
	try {
		const response = await fetch("/api/matches/end", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				playerAId: playerAId,
				playerBId: playerBId,
				result: matchResult, // PLAYER_A_WINS, PLAYER_B_WINS, DRAW
			}),
		});

		if (response.ok) {
			console.log("Match finished");
		}
	} catch (error) {
		console.error("Failed to save the match");
	}
}

export async function getMatchHistory() {
	try {
		// The local storage get the user token
		const token = localStorage.getItem("token");

		const response = await fetch("/api/matches/history", {
			method: "GET",
			headers: {
				"Content-Type": "application/json", // The information comes in Json format
				Authorization: `Bearer ${token}`, // Validates the user token
			},
		});

		if (response.ok) {
			return await response.json(); // Return the needed information
		} else {
			console.error("Failed to load match history: Status", response.status);
			return []; // Sends an empty array to not break it
		}
	} catch (error) {
		console.error("Failed to fetch match history", error);
		return [];
	}
}

// Used to find the match history of the username
export async function getHistoryByUsername(username: string) {
	try {
		const token = localStorage.getItem("token");
		const response = await fetch(`/api/matches/player/${username}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.ok) {
			return await response.json();
		} else {
			console.error("Failed to load match history");
			return [];
		}
	} catch (error) {
		console.error("Network error", error);
		return [];
	}
}
