import { useAuth } from "../../contexts/UserContext";
import { Trophy, Swords, Equal } from "lucide-react";
import { ProfileHeader, ProfileOverview } from "../../components";
import type { ProfileStatsVM } from "../../models/profileStats";
import { userToProfileStats } from "../../mappers/userToProfileStats";
import type { Match, PublicProfile } from "../../types";
import { useEffect, useState } from "react";
import { getPublicProfile } from "../../api/users";
import { getHistoryByUsername } from "../../api/matches";

export function Profile() {
	const { state } = useAuth();
	const user = state.user;

	const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
	const [history, setHistory] = useState<Match[]>([]);

	useEffect(() => {
		const fetchPublicProfile = async () => {
			if (user) {
				try {
					const data = await getPublicProfile(user.username);
					setPublicProfile(data);
				} catch (error) {
					console.error("Failed to load the public profile: ", error);
				}
			}
		};

		const fetchHistory = async () => {
			if (user) {
				try {
					const data = await getHistoryByUsername(user.username);
					setHistory(data);
				} catch (error) {
					console.error("Failed to load the match history: ", error);
				}
			}
		};

		fetchPublicProfile();
		fetchHistory();
	}, [user]);

	const profileStats: ProfileStatsVM = userToProfileStats(publicProfile);

	return (
		<main className="w-full max-w-5xl mx-auto px-4 py-12 text-stone-100">
			{/* Premium Header Summary Card */}
			<ProfileHeader user={user} />

			{/* Premium Dynamic Statistics Grid */}
			{/* <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
				<div
					className="bg-stone-900/20 hover:bg-stone-900/40 p-5 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 flex flex-col gap-2 shadow-sm group items-center"
					style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
					<div className="flex items-center justify-between">
						<p className="text-stone-400 group-hover:text-emerald-400 text-[10px] font-bold uppercase tracking-wider transition-colors">
							Victories
						</p>
						<Trophy
							className="text-emerald-400/70"
							size={14}
						/>
					</div>
					<p className="font-mono text-4xl font-black text-green-400">{user?.score?.wins || 0}</p>
				</div>

				<div
					className="bg-stone-900/20 hover:bg-stone-900/40 p-5 border border-red-500/10 hover:border-red-500/20 transition-all duration-300 flex flex-col gap-2 shadow-sm group items-center"
					style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
					<div className="flex items-center justify-between">
						<p className="text-stone-400 group-hover:text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors">
							Defeats
						</p>
						<Swords
							className="text-red-400/70"
							size={14}
						/>
					</div>
					<p className="font-mono text-4xl font-black text-red-400">{user?.score?.losses || 0}</p>
				</div>

				<div
					className="bg-stone-900/20 hover:bg-stone-900/40 p-5 border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300 flex flex-col gap-2 shadow-sm group items-center"
					style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
					<div className="flex items-center justify-between">
						<p className="text-stone-400 group-hover:text-yellow-400 text-[10px] font-bold uppercase tracking-wider transition-colors">
							Draws
						</p>
						<Equal
							className="text-yellow-400/70"
							size={14}
						/>
					</div>
					<p className="font-mono text-4xl font-black text-yellow-400">{user?.score?.draws || 0}</p>
				</div>

				<div
					className="bg-stone-900/20 hover:bg-stone-900/40 p-5 border border-emerald-500/20 shadow-md shadow-emerald-950/10 flex flex-col gap-2 group"
					style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}>
					<p className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-wider">Elo Rating</p>
					<p className="font-mono text-4xl font-black text-white tracking-tight">
						{user?.score?.elo || 1000}
					</p>
				</div>
			</section> */}
			<div className="mt-8">
				<ProfileOverview
					stats={profileStats}
					recentMatches={history.slice(0, 3)}
				/>
			</div>
		</main>
	);
}
