import { useEffect, useState } from "react";
import { displayElo } from "../../utils/displayElo";
import { Timer } from "../Timer/Timer";
import { useGame } from "../../contexts/GameContext/GameContext";
import { getOpponentData } from "../../api/users";
import type { PlayerData } from "../../api/PlayerDataType";
import magnusImg from "../../assets/magnus-carlsen.jpg";

type RightUserProps = {
	onTimeOut: (loserColor: "w" | "b") => void;
};

export function RightUser({ onTimeOut }: RightUserProps) {
	const { currentTurn, color, opponentId, isSearchingMatch, whiteTimeLeft, blackTimeLeft } = useGame();
	const [opponentProfile, setOpponentProfile] = useState<PlayerData | null>(null);

	// 1. Internal Engine/Bot Resolution Logic
	const normalizedOpponentId = String(opponentId ?? "").toLowerCase();
	const isBotOpponent = normalizedOpponentId.includes("bot");
	const isAIOpponent = normalizedOpponentId.includes("ai") || normalizedOpponentId.includes("stockfish");
	const isEngineOpponent = isBotOpponent || isAIOpponent;

	// 2. Data Sourcing Lifecycle
	useEffect(() => {
		if (!opponentId || isEngineOpponent) {
			setOpponentProfile(null);
			return;
		}

		let cancelled = false;
		getOpponentData(opponentId)
			.then((data) => {
				if (!cancelled) setOpponentProfile(data);
			})
			.catch(() => {
				if (!cancelled) setOpponentProfile(null);
			});

		return () => {
			cancelled = true;
		};
	}, [opponentId, isEngineOpponent]);

	// 3. Computed Status States
	const isActiveTurn = !isSearchingMatch && color != null && currentTurn !== color;
	const opponentTimeLeft = color === "w" ? blackTimeLeft : whiteTimeLeft;

	// 4. Dynamic Identity Assets Assignments
	let username = "Opponent";
	let opponentAvatarUrl: string | undefined = undefined;
	let eloRating: number | null = null;

	if (isSearchingMatch) {
		username = "Searching...";
	} else if (isEngineOpponent) {
		username = isBotOpponent ? "Uncle Carlsen (bot)" : "Uncle Carlsen (AI)";
		opponentAvatarUrl = magnusImg;
		eloRating = 2850;
	} else {
		username = opponentProfile?.username ?? opponentId ?? "Opponent";
		opponentAvatarUrl = opponentProfile?.avatarUrl ?? undefined;
		eloRating = opponentProfile?.score?.elo ?? null;
	}

	return (
		<div
			className={`relative flex w-full min-w-0 items-center justify-end gap-[4%] p-[3%] 
                bg-linear-to-l from-stone-900/40 via-sidebar-bg/90 to-sidebar-bg/40
                backdrop-blur-md rounded-sm border-y border-l transition-all duration-500 select-none group
                hover:scale-[1.03] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]
                ${
					isSearchingMatch
						? "border-emerald-500/30 border-r-2 border-r-emerald-500/50 bg-emerald-950/10"
						: isActiveTurn
							? "border-emerald-500/40 border-r-2 border-r-emerald-400 bg-emerald-500/50 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)]"
							: "border-stone-800 border-r-2 border-r-stone-700 opacity-70"
				}`}>
			{/* Core Info & Timer Block */}
			<div className="flex-1 min-w-0 md:flex flex-row-reverse items-center justify-between gap-[4%]">
				{/* Text Block */}
				<div className="flex flex-col min-w-0 flex-1 items-end text-right">
					{/* Metadata ELO Rating Layer */}
					<div className="group/elo relative w-max overflow-visible text-right">
						<span
							className={`text-[9px] font-mono font-bold tracking-[0.25em] uppercase transition-colors duration-500 leading-none block mb-1
                            ${isSearchingMatch ? "text-emerald-400/70" : isActiveTurn ? "text-emerald-400/90" : "text-stone-500"}`}>
							{isSearchingMatch ? "SYS // LFG" : eloRating ? `ELO // ${eloRating}` : "ELO // N/A"}
						</span>

						{!isSearchingMatch && (
							<div className="z-50 absolute bottom-full right-0 mb-1.5 rounded-sm border border-emerald-500/35 bg-stone-950 px-2 py-0.5 text-[11px] font-mono tracking-wider text-emerald-300 opacity-0 shadow-xl transition-all duration-150 group-hover/elo:opacity-100 group-hover/elo:-translate-y-0.5 whitespace-nowrap pointer-events-none">
								{eloRating ? `${eloRating} Points` : "No Rank Data"}
							</div>
						)}
					</div>

					{/* Username Layer */}
					<div className="group/name relative w-full overflow-visible text-right">
						<h2
							className={`text-[clamp(0.72rem,1vw,2.5rem)] font-black tracking-widest uppercase transition-colors duration-500 leading-none truncate max-w-[11ch] sm:max-w-[14ch] md:max-w-full ml-auto
                            ${isSearchingMatch ? "text-emerald-400 font-bold tracking-normal animate-pulse" : isActiveTurn ? "text-stone-100" : "text-stone-400"}`}>
							{username}
						</h2>

						{!isSearchingMatch && (
							<div className="z-50 absolute bottom-full right-0 mb-1.5 rounded-sm border border-emerald-500/35 bg-stone-950 px-2 py-0.5 text-[11px] font-mono tracking-wider text-emerald-300 opacity-0 shadow-xl transition-all duration-150 group-hover/name:opacity-100 group-hover/name:-translate-y-0.5 whitespace-nowrap pointer-events-none">
								{username}
							</div>
						)}
					</div>

					{/* Title Tier Subtext */}
					<span
						className={`text-[10px] font-bold tracking-wider mt-1 transition-colors duration-500 opacity-80
                        ${isSearchingMatch ? "text-emerald-500/50" : isActiveTurn ? "text-emerald-300/70" : "text-stone-500"}`}>
						{isSearchingMatch ? "MATCHMAKING" : eloRating ? displayElo(eloRating) : "BEGINNER"}
					</span>
				</div>

				{/* Timer / Matchmaking Status Section */}
				<div
					className={`shrink-0 mt-2 md:mt-0 transition-opacity duration-500 ${isActiveTurn || isSearchingMatch ? "opacity-100" : "opacity-60"}`}>
					{isSearchingMatch ? (
						<div className="flex aspect-square h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-stone-950/60 shadow-lg">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />
						</div>
					) : (
						<Timer
							timeLeftInSeconds={opponentTimeLeft}
							isRunning={isActiveTurn}
							onTimeUp={() => {
								const opponentColor = color === "w" ? "b" : "w";
								onTimeOut(opponentColor);
							}}
						/>
					)}
				</div>
			</div>

			{/* Avatar Section */}
			<div className="relative shrink-0 w-[34%] md:w-[22%] aspect-square flex items-center justify-center p-1.5">
				{isSearchingMatch ? (
					<div className="w-full h-full rounded-full border border-emerald-500/30 bg-linear-to-br from-stone-950 to-stone-900 shadow-inner flex items-center justify-center">
						<div className="h-6 w-6 rounded-full border-2 border-emerald-500/10 border-t-emerald-400 animate-spin" />
					</div>
				) : (
					<img
						src={opponentAvatarUrl}
						alt={opponentAvatarUrl ? "Avatar" : ""}
						className={`w-full h-full object-fit rounded-full ring-2 transition-all duration-500
                            ${isActiveTurn ? "ring-emerald-400 shadow-lg shadow-emerald-500/20" : "ring-stone-700"}`}
					/>
				)}

				<div
					aria-hidden="true"
					className={`absolute -top-px -left-px w-2 h-2 border-t border-l transition-colors duration-500 ${isActiveTurn || isSearchingMatch ? "border-emerald-400" : "border-stone-600"}`}
				/>
				<div
					aria-hidden="true"
					className={`absolute -bottom-px -right-px w-2 h-2 border-b border-r transition-colors duration-500 ${isActiveTurn || isSearchingMatch ? "border-emerald-400" : "border-stone-600"}`}
				/>
			</div>

			{/* Right Accent */}
			<div
				aria-hidden="true"
				className={`flex flex-col gap-0.75 shrink-0 transition-all duration-500 ${isActiveTurn || isSearchingMatch ? "opacity-100" : "opacity-40"}`}>
				<div
					className={`w-1 h-3 transform -skew-x-12 transition-colors duration-500 ${isActiveTurn || isSearchingMatch ? "bg-emerald-400" : "bg-stone-500"}`}
				/>
				<div
					className={`w-1 h-1 transform -skew-x-12 transition-colors duration-500 ${isActiveTurn || isSearchingMatch ? "bg-emerald-400/40" : "bg-stone-500/20"}`}
				/>
			</div>

			{/* Precision Wire Decal */}
			<div
				aria-hidden="true"
				className={`absolute left-0 top-0 bottom-0 w-0.75 transition-all duration-500 bg-linear-to-b
                    ${
						isActiveTurn || isSearchingMatch
							? "from-emerald-400/60 via-transparent to-emerald-400/20"
							: "from-stone-700/40 via-transparent to-stone-800/20"
					}`}
			/>

			{/* Sub-surface Glowing Underline Tracker */}
			<div
				className={`absolute bottom-0 right-12 left-6 h-px bg-linear-to-l from-emerald-400/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
			/>
		</div>
	);
}
