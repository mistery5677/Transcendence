export type Match = {
	createdAt: Date;
	gameId: number;
	opponent: string;
	result: "WIN" | "LOSS" | "DRAW";
	playedAs: string;
};
