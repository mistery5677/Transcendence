import type { Score } from "./score";

export type PublicProfile = {
	id: number;
	username: string;
	boardTheme: 1 | 2 | 3;
	backgroundTheme: 1 | 2 | 3 | 4 | 5;
	avatarUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
	score: Score;
};
