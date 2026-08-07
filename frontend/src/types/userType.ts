import type { Score } from "./scoreType";
import type { UserStatus } from "./userStatusType";

export type User = {
	id: number;
	name: string | null;
	username: string;
	email: string;
	avatarUrl: string;
	createdAt: string;
	updatedAt: string;
	boardTheme: 1 | 2 | 3;
	backgroundTheme: 1 | 2 | 3 | 4 | 5;
	score: Score | null;
};

export const friends: {
	status: UserStatus;
	id: number;
	username: string;
	avatarUrl: string | null;
	score: {
		userId: number;
		id: number;
		wins: number;
		losses: number;
		draws: number;
		elo: number;
		totalGames: number;
		bestWinStreak: number;
		currentWinStreak: number;
		bestElo: number;
	} | null;
}[];
