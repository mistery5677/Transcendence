import { BACKGROUND_THEMES, BOARD_THEMES } from "../../constants";
import type { PublicProfile, User } from "../../types/index";
import { displayElo } from "../../utils/displayElo";
import { TitleFrame } from "../TitleFrame/TitleFrame";

type Props = {
	user: User | PublicProfile | null;
};

export function ProfileHeader({ user }: Props) {
	return (
		<header className="relative overflow-hidden mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-stone-900/40 p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl backdrop-blur-md">
			{/* Glow */}
			<div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

			{/* LEFT SIDE */}
			<div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full md:w-auto">
				<div className="relative shrink-0">
					<img
						src={user?.avatarUrl || "/api/assets/avatars/default1.png"}
						alt="Profile avatar"
						className="h-28 w-28 rounded-full border border-emerald-400/30 object-fit shadow-2xl ring-4 ring-emerald-500/5"
						onError={(e) => {
							e.currentTarget.src = "/api/assets/avatars/default1.png";
						}}
					/>
				</div>

				<div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 flex-1 min-w-0">
					<h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white truncate w-full max-w-[18ch]">
						{user?.username || "Player"}
					</h1>

					<div className="inline-flex items-center text-[clamp(0.65rem,0.72vw,1rem)] font-bold tracking-wider text-emerald-300">
						<TitleFrame>{displayElo(user?.score?.elo as number) || "NO RANKED"}</TitleFrame>
					</div>
				</div>
			</div>

			{/* RIGHT SIDE */}
			<div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col gap-4 md:gap-2 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/10 sm:text-center md:text-right">
				<div className="flex flex-col md:items-end">
					<span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">{user && "email" in user ? "Email" : "Profile Created"}</span>
					<span className="text-sm font-semibold text-stone-200 truncate max-w-[22ch]">
						{user && "email" in user ? user.email : user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
					</span>
				</div>

				<div className="flex flex-col md:items-end">
					<span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Board Style</span>
					<span className="text-sm font-semibold text-emerald-400">
						{BOARD_THEMES[user?.boardTheme || 1]}
					</span>
				</div>

				<div className="flex flex-col md:items-end">
					<span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Background</span>
					<span className="text-sm font-semibold text-stone-200">{BACKGROUND_THEMES[user?.backgroundTheme || 1]}</span>
				</div>
			</div>
		</header>
	);
}
