export interface PlayerData {
	id: number;
	rank: number;
	username: string;
	avatarUrl?: string;
	score: {
		elo: number;
		wins: number;
		losses: number;
	};
}
