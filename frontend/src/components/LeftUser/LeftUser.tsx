import { displayElo } from "../../utils/displayElo";
import { Timer } from "../Timer/Timer";
import { useGame } from "../../context/Game/GameContext";
import type { User } from "../../context/auth/authTypes";

type LeftUserProps = {
	state: { user: User | null; isLoading: boolean };
	onTimeOut: (loserColor: "w" | "b") => void;
};

export function LeftUser({ state, onTimeOut }: LeftUserProps) {
	const {
		currentTurn,
		color,
		whiteTimeLeft,
		blackTimeLeft,
		isSpectator,
		spectatorPlayerWName,
		spectatorPlayerWAvatar,
	} = useGame();

	// Internal values based on game context
	const isActiveTurn = isSpectator ? currentTurn === "w" : color != null && currentTurn === color;
	const myTimeLeft = color === "w" ? whiteTimeLeft : blackTimeLeft;

	const username = isSpectator
		? (spectatorPlayerWName ?? "Player")
		: state.user
			? state.user.username
			: "Player 1";
	const avatarSrc = isSpectator ? (spectatorPlayerWAvatar ?? undefined) : state.user?.avatarUrl;
	const eloRating = state.user?.score?.elo;

	return (
		<div
			className={`relative flex w-full min-w-0 items-center gap-[4%] p-[3%] 
                bg-linear-to-r from-stone-900/40 via-sidebar-bg/90 to-sidebar-bg/40
                backdrop-blur-md rounded-sm border-y border-r transition-all duration-500 select-none group
                hover:scale-[1.03] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]
                ${
					isActiveTurn
						? "border-emerald-500/40 border-l-2 border-l-emerald-400 bg-emerald-500/50  shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)]"
						: "border-stone-800 border-l-2 border-l-stone-700 opacity-70"
				}`}>
			{/* Left Accent: Threat/Status Stripes */}
			<div
				aria-hidden="true"
				className={`flex flex-col gap-0.75 shrink-0 transition-all duration-500 ${isActiveTurn ? "opacity-100" : "opacity-40"}`}>
				<div
					className={`w-1 h-3 transform -skew-x-12 transition-colors duration-500 ${isActiveTurn ? "bg-emerald-400" : "bg-stone-500"}`}
				/>
				<div
					className={`w-1 h-1 transform -skew-x-12 transition-colors duration-500 ${isActiveTurn ? "bg-emerald-400/40" : "bg-stone-500/20"}`}
				/>
			</div>

			{/* Avatar Section - Restored to exact original scale (w-[34%]) */}
			<div className="relative shrink-0 w-[34%] md:w-[22%] aspect-square flex items-center justify-center p-1.5">
				{/* The Circular photo */}
				<img
					src={avatarSrc}
					alt="User Avatar"
					className={`w-full h-full object-fit rounded-full ring-2 transition-all duration-500
                        ${isActiveTurn ? "ring-emerald-400 shadow-lg shadow-emerald-500/20" : "ring-stone-700"}`}
				/>

				{/* Asymmetric Cyber-Brackets framing the avatar housing boundary */}
				<div
					aria-hidden="true"
					className={`absolute -top-px -left-px w-2 h-2 border-t border-l transition-colors duration-500 ${isActiveTurn ? "border-emerald-400" : "border-stone-600"}`}
				/>
				<div
					aria-hidden="true"
					className={`absolute -bottom-px -right-px w-2 h-2 border-b border-r transition-colors duration-500 ${isActiveTurn ? "border-emerald-400" : "border-stone-600"}`}
				/>
			</div>

			{/* Core Info & Timer Block */}
			<div className="flex-1 min-w-0 md:flex items-center justify-between gap-[4%]">
				{/* Text Block (Metadata ELO + Username) */}
				<div className="flex flex-col min-w-0 flex-1">
					{/* Metadata ELO Rating Layer */}
					<div className="group/elo relative w-max overflow-visible text-left">
						<span
							className={`text-[9px] font-mono font-bold tracking-[0.25em] uppercase transition-colors duration-500 leading-none block mb-1
                            ${isActiveTurn ? "text-emerald-400/90" : "text-stone-500"}`}>
							{eloRating ? `ELO // ${eloRating}` : "ELO // N/A"}
						</span>

						{/* Hover Tooltip for Elo Details */}
						<div className="z-50 absolute bottom-full left-0 mb-1.5 rounded-sm border border-emerald-500/35 bg-stone-950 px-2 py-0.5 text-[11px] font-mono tracking-wider text-emerald-300 opacity-0 shadow-xl transition-all duration-150 group-hover/elo:opacity-100 group-hover/elo:-translate-y-0.5 whitespace-nowrap pointer-events-none">
							{eloRating ? `${eloRating} Points` : "No Rank Data"}
						</div>
					</div>

					{/* Username Layer */}
					<div className="group/name relative w-full overflow-visible text-left">
						<h2
							className={`text-[clamp(0.72rem,1vw,2.5rem)] font-black tracking-widest uppercase transition-colors duration-500 leading-none truncate max-w-[11ch] sm:max-w-[14ch] md:max-w-full
                            ${isActiveTurn ? "text-stone-100" : "text-stone-400"}`}>
							{username}
						</h2>

						{/* Full Username Tooltip if truncated */}
						<div className="z-50 absolute bottom-full left-0 mb-1.5 rounded-sm border border-emerald-500/35 bg-stone-950 px-2 py-0.5 text-[11px] font-mono tracking-wider text-emerald-300 opacity-0 shadow-xl transition-all duration-150 group-hover/name:opacity-100 group-hover/name:-translate-y-0.5 whitespace-nowrap pointer-events-none">
							{username}
						</div>
					</div>

					{/* Title Tier Subtext */}
					<span
						className={`text-[10px] font-bold tracking-wider mt-1 transition-colors duration-500 opacity-80
                        ${isActiveTurn ? "text-emerald-300/70" : "text-stone-500"}`}>
						{isSpectator ? "" : state.user ? displayElo(state.user.score?.elo as number) : "NO RANK"}
					</span>
				</div>

				{/* Timer Section */}
				<div
					className={`shrink-0 mt-2 md:mt-0 transition-opacity duration-500 ${isActiveTurn ? "opacity-100" : "opacity-60"}`}>
					<Timer
						timeLeftInSeconds={isSpectator ? whiteTimeLeft : myTimeLeft}
						isRunning={isActiveTurn}
						onTimeUp={() => {
							if (color) onTimeOut(color);
						}}
					/>
				</div>
			</div>

			{/* Precision Wire Decal (Right Sub-Border) */}
			<div
				aria-hidden="true"
				className={`absolute right-0 top-0 bottom-0 w-0.75 transition-all duration-500 bg-linear-to-b
                    ${
						isActiveTurn
							? "from-emerald-400/60 via-transparent to-emerald-400/20"
							: "from-stone-700/40 via-transparent to-stone-800/20"
					}`}
			/>

			{/* Sub-surface Glowing Underline Tracker */}
			<div
				className={`absolute bottom-0 left-12 right-6 h-px bg-linear-to-r from-emerald-400/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
			/>
		</div>
	);
}