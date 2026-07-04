import type { ProfileStatsVM } from "../../models/profileStats";
import type { Match } from "../../types";
import { getDailyAvgLosses, getDailyAvgWins } from "../../utils/getAvgMatchResult";

type Props = {
	stats: ProfileStatsVM;
	history: Match[];
};

export function ProfileStats({ stats, history }: Props) {
	const netElo = (getDailyAvgWins(history) ?? 0) - (getDailyAvgLosses(history) ?? 0);

	const summary =
		(stats.winRate ?? 0) > 60
			? {
					label: "Strong",
					color: "bg-emerald-400",
					text: "Strong performance with consistent wins and solid ELO growth.",
				}
			: (stats.winRate ?? 0) > 45
				? {
						label: "Balanced",
						color: "bg-amber-400",
						text: "Balanced performance with room for improvement in consistency.",
					}
				: {
						label: "Struggling",
						color: "bg-red-400",
						text: "Currently struggling — focus on improving match fundamentals.",
					};

	return (
		<div className="space-y-6">
			{/* MAIN GRID */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				<Stat
					label="Total Games"
					value={stats.totalGames ?? 0}
				/>
				<Stat
					label="Wins"
					value={stats.wins ?? 0}
					accent="text-emerald-400"
				/>
				<Stat
					label="Losses"
					value={stats.losses ?? 0}
					accent="text-red-400"
				/>
				<Stat
					label="Draws"
					value={stats.draws ?? 0}
					accent="text-yellow-400"
				/>
				<Stat
					label="Win Rate"
					value={`${stats.winRate ?? 0}%`}
					footer={
						<div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
							<div
								className="h-full bg-emerald-400/80 rounded-full"
								style={{ width: `${Math.min(stats.winRate ?? 0, 100)}%` }}
							/>
						</div>
					}
				/>
				<Stat
					label="Best Win Streak"
					value={stats.bestWinStreak ?? 0}
					accent="text-amber-300"
				/>
				<Stat
					label="Current Streak"
					value={stats.currentStreak ?? 0}
				/>
			</div>

			{/* PERFORMANCE INSIGHT */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-stone-900/40 border border-white/10 rounded-xl p-5 backdrop-blur-md">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-white font-bold">
							Today's ELO Performance <span className="text-xl">{netElo >= 0 ? "▲" : "▼"}</span>
						</h3>
						<span
							className={`font-mono text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
								netElo >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
							}`}>
							net {netElo > 0 ? "+" : ""}
							{netElo}
						</span>
					</div>

					<div className="space-y-2.5 text-sm">
						<div className="flex justify-between items-center text-stone-300">
							<span>Avg Gain</span>
							<span className="text-emerald-400 font-mono font-semibold tabular-nums">
								+{getDailyAvgWins(history) ?? 0}
							</span>
						</div>

						<div className="flex justify-between items-center text-stone-300">
							<span>Avg Loss</span>
							<span className="text-red-400 font-mono font-semibold tabular-nums">
								-{getDailyAvgLosses(history) ?? 0}
							</span>
						</div>
					</div>
				</div>

				<div className="bg-stone-900/40 border border-white/10 rounded-xl p-5 backdrop-blur-md">
					<div className="flex items-center gap-2 mb-2">
						<span className={`h-2 w-2 rounded-full ${summary.color}`} />
						<h3 className="text-white font-bold">Performance Summary</h3>
					</div>

					<p className="text-stone-300 text-sm leading-relaxed">{summary.text}</p>
				</div>
			</div>
		</div>
	);
}

/* ---------------- helper ---------------- */

function Stat({
	label,
	value,
	accent,
	footer,
}: {
	label: string;
	value: string | number;
	accent?: string;
	footer?: React.ReactNode;
}) {
	return (
		<div className="bg-stone-900/40 border border-white/10 rounded-xl p-4 backdrop-blur-md">
			<p className="text-stone-400 text-xs uppercase tracking-wider">{label}</p>
			<p className={`font-mono text-xl font-bold tabular-nums mt-1 ${accent ?? "text-white"}`}>{value}</p>
			{footer}
		</div>
	);
}
