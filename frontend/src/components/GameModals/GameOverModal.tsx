import { useEffect, useState } from "react";
import { useGame } from "../../contexts/GameContext/GameContext";

export function GameOverModal() {
	const {
		gameOver,
		color,
		proposeRematch,
		rematchProposal,
		handleRematchResponse,
		resetGameContextToDefault,
		isSpectator,
		isSwitchingGame,
		spectatorPlayerWName,
		spectatorPlayerBName,
		mode,
	} = useGame();
	const [isDismissed, setIsDismissed] = useState(false);
	const [isWaitingForRematchProposal, setIsWaitingForRematchProposal] = useState(false);

	useEffect(() => {
		if (gameOver) {
			setIsDismissed(false);
			setIsWaitingForRematchProposal(false);
		}
	}, [gameOver]);

	useEffect(() => {
		if (isSpectator) return;
		const isVsComputer = opponentId === "bot" || opponentId === "stockfish";
		if (!rematchProposal && !(isWaitingForRematchProposal && isVsComputer)) return;

		console.log("Auto-accepting rematch proposal");
		handleRematchResponse(true);
		setIsWaitingForRematchProposal(false);
	}, [rematchProposal, isWaitingForRematchProposal, opponentId, handleRematchResponse, isSpectator]);

	if (!gameOver || isDismissed || isSwitchingGame) return null;

	const isWinner = gameOver.winnerColor === color;
	const isDraw = gameOver.winnerColor === null;

	const handlePlayAgain = () => {
		if (rematchProposal) {
			handleRematchResponse(true);
			setIsWaitingForRematchProposal(false);
		} else {
			proposeRematch();
			setIsWaitingForRematchProposal(true);
		}
		setIsDismissed(true);
	};

	const getMatchMessage = () => {
		if (isDraw) return "A tough battle with no clear winner.";

		if (isSpectator) {
			const winnerName =
				gameOver.winnerColor === "w" ? spectatorPlayerWName : (spectatorPlayerBName ?? "Uncle Carlsen");
			return winnerName ? `${winnerName} won the match.` : "The match is over.";
		}

		if (isWinner) {
			if (mode === "ai" || mode === "bot") return "Good job! You win against the AI.";
			if (mode === "friend") return "You crushed your friend! (Friendly match)";
			return "You crushed the opponent! +8 ELO";
		}

		if (mode === "ai" || mode === "bot") return "The AI outplayed you.";
		if (mode === "friend") return "Your friend outplayed you. Better luck next time!";
		return "The opponent outplayed you. -8 ELO";
	};

	const getTitle = () => {
		if (isDraw) return "DRAW";
		if (isSpectator) return "GAME OVER";
		return isWinner ? "VICTORY!" : "DEFEAT";
	};

	const handleNavigation = (url: string) => {
		if (resetGameContextToDefault) {
			resetGameContextToDefault();
		}
		window.location.href = url;
	};

	return (
		<div
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					if (resetGameContextToDefault) {
						resetGameContextToDefault(); // !Here for the moment clean if the player click outside, can be left to analyze the game
					}
					setIsDismissed(true);
				}
			}}
			className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-[4%] backdrop-blur-md animate-in fade-in duration-500">
			<div className="flex w-full max-w-[min(92vw,38rem)] -translate-y-[18%] flex-col items-center gap-[clamp(1rem,2.5vw,1.5rem)] rounded-[clamp(1rem,2vw,1.5rem)] border border-popup-border-green bg-sidebar-bg p-[clamp(1.25rem,4vw,2.5rem)] text-center shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] transition-all sm:translate-y-0">
				<h2
					className={`bg-linear-to-r bg-clip-text text-[clamp(2rem,7vw,3.5rem)] font-black text-transparent ${isDraw || isSpectator ? "from-stone-300 to-stone-400" : isWinner ? "from-button-green to-green-400" : "from-red-500 to-red-400"}`}>
					{getTitle()}
				</h2>

				<p className="max-w-[32ch] text-[clamp(0.95rem,2.5vw,1.125rem)] text-slate-400">{getMatchMessage()}</p>

				<span className="text-[clamp(0.7rem,1.8vw,0.8rem)] font-mono uppercase tracking-[0.25em] text-emerald-500/50">
					Reason: {gameOver.reason}
				</span>

				<div className="mt-2 flex w-full flex-col gap-3 sm:mt-4 sm:flex-row">
					{isSpectator ? (
						<button
							type="button"
							onClick={() => handleNavigation("/live-games")}
							className="w-full rounded-xl bg-button-green px-[clamp(1rem,2.5vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.9rem,2vw,1rem)] font-bold text-slate-950 transition-all hover:bg-button-green-hover">
							Back to Live Games
						</button>
					) : (
						<>
							<button
								type="button"
								onClick={handlePlayAgain}
								className="w-full rounded-xl bg-button-green px-[clamp(1rem,2.5vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.9rem,2vw,1rem)] font-bold text-slate-950 transition-all hover:bg-button-green-hover sm:flex-1">
								Play Again
							</button>
							<button
								type="button"
								onClick={() => handleNavigation("/play")}
								className="w-full rounded-xl bg-button-green px-[clamp(1rem,2.5vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.9rem,2vw,1rem)] font-bold text-slate-950 transition-all hover:bg-button-green-hover sm:flex-1">
								New Match
							</button>
							<button
								type="button"
								onClick={() => handleNavigation("/settings")}
								className="w-full rounded-xl border border-slate-600 bg-button-stone px-[clamp(1rem,2.5vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.9rem,2vw,1rem)] font-bold text-white transition-all hover:bg-stone-700 sm:flex-1">
								View Stats
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
