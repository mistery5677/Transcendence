import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSocket } from "../../contexts/GlobalSocketContext/GlobalSocketContext";
import { useGame } from "../../contexts/GameContext/GameContext";
import { useAuth } from "../../contexts/UserContext";
import magnusImg from "../../assets/magnus-carlsen.jpg";

type ActiveGame = {
	gameId: string;
	playerW: string;
	playerB: string;
	mode: "online" | "bot" | "ai";
	playerWName?: string;
	playerBName?: string;
	playerWAvatar?: string;
	playerBAvatar?: string;
};

export function LiveGames() {
	const { socket } = useGlobalSocket();
	const { state: authState } = useAuth();
	const { spectateGame } = useGame();
	const navigate = useNavigate();
	const [games, setGames] = useState<ActiveGame[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	

	useEffect(() => {
		if (!socket) return;

		const handleActiveGames = (activeGames: ActiveGame[]) => {
			setGames(activeGames);
			setIsLoading(false);
		};

		socket.on("activeGames", handleActiveGames);
		socket.emit("listActiveGames");

		return () => {
			socket.off("activeGames", handleActiveGames);
		};
	}, [socket]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-stone-800 flex flex-col items-center justify-center gap-4 text-stone-100">
				<p className="text-emerald-300 font-semibold animate-pulse">Loading live games...</p>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-stone-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-stone-100">
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/20 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/20 blur-3xl" />

			<div className="relative max-w-4xl mx-auto">
				<div className="text-center mb-12 animate-fade-in">
					<h1 className="text-4xl sm:text-5xl font-black text-stone-100 tracking-tight">
						Live{" "}
						<span className="text-transparent bg-clip-text bg-linear-to-r from-lime-300 to-emerald-300">
							Games
						</span>
					</h1>
				</div>

				<div className="bg-stone-700/50 rounded-3xl border border-stone-700 shadow-2xl backdrop-blur-md overflow-hidden p-6">
					{games.length === 0 ? (
						<p className="text-center py-8 text-stone-500">No games currently in progress.</p>
					) : (
						<div className="space-y-4">
							{games.map((game) => {
								const isOwnGame = authState.user
									? String(game.playerW) === String(authState.user.id) || String(game.playerB) === String(authState.user.id)
									: false;

								return (
									<div
										key={game.gameId}
										className="flex items-center justify-between bg-stone-800/40 rounded-2xl border border-stone-700 p-4">
										<div className="flex items-center gap-3 min-w-0">
											<div className="flex items-center gap-2 min-w-0">
												<img
													src={game.playerWAvatar ?? "/assets/avatars/default1.png"}
													alt={game.playerWName ?? "Player"}
													className="w-9 h-9 rounded-full object-cover border-2 border-stone-600 shrink-0"
												/>
												<span className="text-stone-100 font-bold tracking-wide truncate max-w-[9ch] sm:max-w-[14ch]">
													{game.playerWName ?? game.playerW}
												</span>
											</div>

											<span className="shrink-0 text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400/80 bg-emerald-500/10 border border-emerald-700/30 rounded-full px-2 py-1">
												VS
											</span>

											<div className="flex items-center gap-2 min-w-0">
												<span className="text-stone-100 font-bold tracking-wide truncate max-w-[9ch] sm:max-w-[14ch]">
													{game.mode === "online" ? (game.playerBName ?? game.playerB) : `Uncle Carlsen (${game.mode})`}
												</span>
												<img
													src={game.mode === "online" ? (game.playerBAvatar ?? "/assets/avatars/default1.png") : magnusImg}
													alt={game.mode === "online" ? (game.playerBName ?? "Player") : "Uncle Carlsen"}
													className="w-9 h-9 rounded-full object-cover border-2 border-stone-600 shrink-0"
												/>
											</div>
										</div>
										<button
											onClick={() => {
												if (isOwnGame) return;
												spectateGame(game.gameId);
												navigate("/play");
											}}
											disabled={isOwnGame}
											className={
												isOwnGame
													? "px-5 py-2 rounded-xl bg-stone-800/40 text-stone-500 border border-stone-700 cursor-not-allowed font-semibold"
													: "px-5 py-2 rounded-xl bg-emerald-900/30 text-emerald-300 border border-emerald-700/30 hover:bg-emerald-800/40 cursor-pointer font-semibold transition-colors"
											}>
											{isOwnGame ? "Your game" : "Watch"}
										</button>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}