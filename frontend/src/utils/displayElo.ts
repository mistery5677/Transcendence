export function displayElo(elo: number | null) {
	if (elo === null) return "N/A";

	if (elo <= 700) return "ROKKIE";
	if (elo > 700 && elo <= 1000) return "CHALLENGER";
	if (elo > 1000 && elo <= 1200) return "MASTER";
	if (elo > 1200 && elo <= 1500) return "GRANDMASTER";
	if (elo > 1500) return "ALUMINUM";
}
