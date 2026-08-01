import type { Score } from "./scoreType";
import type { UserStatus } from "./userStatusType";

export type Friend = {
	status: UserStatus;
	id: number;
	username: string;
	avatarUrl: string | null;
	score: Score | null;
};
