export function getWinRate(wins: number, losses: number): number {
	const totalGames = wins + losses;
	if (totalGames === 0) {
		return 0;
	}
	return Math.round((wins / totalGames) * 100);
}
