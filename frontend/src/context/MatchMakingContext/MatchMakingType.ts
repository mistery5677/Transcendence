import type { MatchStartOptions } from "../GameContext/GameContextType";

export type MatchMakingContextType = {
	isSearchingMatch: boolean;
	setIsSearchingMatch: React.Dispatch<React.SetStateAction<boolean>>;
	startOnlineGame: (options: MatchStartOptions) => void;
	startBotGame: (options: MatchStartOptions) => void;
	startAIGame: (options: MatchStartOptions) => void;
	inviteToPlay: (friendId: number) => void;
	respondToGameInvite: (hostId: string, accept: boolean, notificationId: string) => void;
};
