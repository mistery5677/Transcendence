// Profile Stats View Model
export type ProfileStatsVM = {
	userId: number;
	totalGames?: number;
	wins?: number;
	losses?: number;
	draws?: number;
	currentElo?: number;
	winRate?: number;
	bestWinStreak?: number;
	currentStreak?: number;
	averageEloGain?: number;
	averageEloLoss?: number;
	bestElo?: number;
};
