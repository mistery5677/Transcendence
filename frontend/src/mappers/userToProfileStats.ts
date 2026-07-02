import type { PublicProfile } from "../types/index";
import type { ProfileStatsVM } from "../models/profileStats";
import { getWinRate } from "../utils/getWinRate";

export function userToProfileStats(user: PublicProfile | null): ProfileStatsVM {
	const score = user?.score;

	console.log("userToProfileStats: User score:", score);

	if (!score) {
		return {
			userId: 0,
			totalGames: 0,
			wins: 0,
			losses: 0,
			draws: 0,
			winRate: 0,
			currentElo: 0,
			bestElo: 0,
			bestWinStreak: 0,
			currentStreak: 0,
			averageEloGain: 0,
			averageEloLoss: 0,
		};
	}

	// These 2 DO NOT exist in backend → either:
	// 1. calculate later from match history (best option)
	// 2. or placeholder for now


	const winRate = getWinRate(score.wins, score.losses);

	return {
		userId: user?.id,
		totalGames: score.totalGames,
		wins: score.wins,
		losses: score.losses,
		draws: score.draws,
		winRate: winRate,
		currentElo: score.elo,
		bestElo: score.bestElo,
		bestWinStreak: score.bestWinStreak,
		currentStreak: score.currentWinStreak,
		averageEloGain: user.score.averageEloGain, // needs match history
		averageEloLoss: user.score.averageEloLoss, // needs match history
	};
}
