import type { Score } from "./score";

type onlineMatch = {
	id: number;
	playerAId: number;
	playerBId: number;
	result: string | null;
	createdAt: string;
	updatedAt: string;
};
type offlineMatch = {
	type: "AI" | "HUMAN";
	playerAId: number;
	playerBId: number;
	result: string | null;
	createdAt: string;
	updatedAt: string;
};

type match = onlineMatch | offlineMatch;

type matchHistory = {
	matches: match[];
};

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
