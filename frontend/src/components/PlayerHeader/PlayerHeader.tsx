import { LeftUser } from "../index";
import type { AuthState } from "../../context/UserContext/authTypes";
import { RightUser } from "../RightUser/RightUser";

type PlayerHeaderProps = {
	state: AuthState;
	className?: string | undefined;
	onTimeOut: (loserColor: "w" | "b") => void;
};

export function PlayerHeader({ state, onTimeOut, className = "" }: PlayerHeaderProps) {
	return (
		<div
			className={`max-h-full grid w-full  grid-cols-[1fr_auto_1fr] items-center gap-[2%] rounded-2xl border border-emerald-300/15 bg-stone-900/70 p-[2.5%] text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm ${className}`}>
			<LeftUser
				state={state}
				onTimeOut={onTimeOut}
			/>

			{/* VS — diamond plate + gradient type */}
			<div className="flex w-full flex-col items-center justify-self-center shrink-0">
				<span className="mb-[8%] text-[clamp(0.6rem,0.8vw,2.95rem)] font-bold tracking-widest text-slate-500">
					MATCH
				</span>
				<div className="relative flex aspect-square w-[65%] items-center justify-center">
					<div
						className="absolute inset-0 rotate-45 rounded-md border border-emerald-400/35 bg-linear-to-br from-stone-800/90 to-stone-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
						aria-hidden
					/>
					<span className="relative z-10 bg-linear-to-br from-emerald-200 via-emerald-400 to-teal-500 bg-clip-text text-[90%] font-black italic leading-none text-transparent drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
						VS
					</span>
				</div>
			</div>

			<RightUser onTimeOut={onTimeOut} />
		</div>
	);
}
