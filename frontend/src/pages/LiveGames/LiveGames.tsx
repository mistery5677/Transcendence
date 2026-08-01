import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSocket } from "../../context/GlobalSocket/GlobalSocketContext";
import { useGame } from "../../context/Game/GameContext";
import { useAuth } from "../../context/auth";
import magnusImg from "../../assets/magnus-carlsen.jpg";

type ActiveGame = {
	gameId: string;
	playerW: string;
	playerB: string;
	mode: "online" | "bot" | "ai" | "friend";
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
				<div className="relative flex flex-col items-center gap-3 mb-10 sm:mb-12 sm:block animate-fade-in">
					<div className="order-2 sm:order-none sm:absolute sm:right-0 sm:top-1 flex items-center gap-2 rounded-full border border-emerald-700/30 bg-button-green px-3 py-1.5">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
						</span>
						<span className="text-xs font-mono font-bold tracking-widest text-white-smoke">
							{games.length} LIVE
						</span>
					</div>

					<h1 className="order-1 sm:order-none text-center text-3xl sm:text-4xl lg:text-5xl font-black text-stone-100 tracking-tight">
						Live{" "}
						<span className="text-transparent bg-clip-text bg-linear-to-r from-lime-300 to-emerald-300">
							Games
						</span>
					</h1>
				</div>

				<div className="bg-stone-700/50 rounded-2xl sm:rounded-3xl border border-stone-700 shadow-2xl backdrop-blur-md overflow-hidden p-3 sm:p-6">
					{games.length === 0 ? (
						<p className="text-center py-8 text-stone-500">No games currently in progress.</p>
					) : (
						<div className="space-y-3 sm:space-y-4">
							{games.map((game) => {
								const isOwnGame = authState.user
									? String(game.playerW) === String(authState.user.id) ||
										String(game.playerB) === String(authState.user.id)
									: false;

								return (
									<div
										key={game.gameId}
										className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-stone-800/40 rounded-2xl border border-stone-700 p-3 sm:p-4">
										<div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
											<div className="relative flex items-center shrink-0 gap-3 sm:gap-5">
												<img
													src={game.playerWAvatar ?? "/assets/avatars/default1.png"}
													alt={game.playerWName ?? "Player"}
													className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-emerald-500/60 shrink-0 relative z-10"
												/>
												<img
													src={
														game.mode === "online" || game.mode === "friend"
															? (game.playerBAvatar ?? "/assets/avatars/default1.png")
															: magnusImg
													}
													alt={
														game.mode === "online" || game.mode === "friend"
															? (game.playerBName ?? "Player")
															: "Uncle Carlsen"
													}
													className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-stone-600 shrink-0 -ml-3 sm:-ml-4"
												/>
											</div>

											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-stone-100 font-bold tracking-wide">
													<span className="truncate max-w-[8ch] xs:max-w-[10ch] sm:max-w-none">
														{game.playerWName ?? game.playerW}
													</span>
													<span className="text-emerald-400/70 font-normal shrink-0 text-sm sm:text-base">
														vs
													</span>
													<span className="truncate max-w-[8ch] xs:max-w-[10ch] sm:max-w-none">
														{game.mode === "online" || game.mode === "friend"
															? (game.playerBName ?? game.playerB)
															: "Uncle Carlsen"}
													</span>
												</div>
												{game.mode !== "online" && (
													<span className="text-[11px] font-semibold tracking-wide text-stone-400 uppercase">
														{game.mode} match
													</span>
												)}
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
													? "w-full sm:w-auto px-5 py-2 rounded-xl bg-stone-800/40 text-stone-500 border border-stone-700 cursor-not-allowed font-semibold shrink-0"
													: "w-full sm:w-auto px-5 py-2 rounded-xl bg-button-green text-white border border-emerald-700/30 hover:translate-y-[-2px] transition-transform cursor-pointer font-semibold transition-colors shrink-0"
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
