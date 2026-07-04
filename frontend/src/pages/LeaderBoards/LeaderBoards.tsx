import { IconTrophy, IconMedal } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { getLeaderboard } from "../../api/users";
import { Link } from "react-router-dom";

interface PlayerData {
	id: number;
	rank: number;
	username: string;
	avatarUrl?: string;
	score: {
		elo: number;
		wins: number;
		losses: number;
	};
}

function classNames(...classes: (string | undefined | false)[]): string {
	return classes.filter(Boolean).join(" ");
}

export function LeaderBoards() {
	const [players, setPlayers] = useState<PlayerData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		//Get all player data from data base
		const getPlayers = async () => {
			try {
				//Function to get the players from data-base
				const data = await getLeaderboard();
				setPlayers(data);
			} catch (error) {
				console.error("Failed to load the leaderboard. Error Message: ", error);
			} finally {
				// Stop the loading from getting all the data
				setIsLoading(false);
			}
		};

		// We call the function that we created
		getPlayers();
	}, []);

	// Make the first, second and third place special colors
	const getRankStyle = (rank: number) => {
		switch (rank) {
			case 1:
				return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
			case 2:
				return "text-slate-300 bg-slate-300/10 border-slate-300/20";
			case 3:
				return "text-amber-600 bg-amber-600/10 border-amber-600/20";
			default:
				return "text-stone-400 border-transparent";
		}
	};

	// We wait until we have all the players
	if (isLoading) {
		return (
			<div className="min-h-screen bg-stone-800 flex flex-col items-center justify-center gap-4 text-stone-100">
				<IconTrophy
					size={48}
					className="text-emerald-400 animate-bounce"
				/>
				<p className="text-emerald-300 font-semibold animate-pulse">Loading the rankings...</p>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-stone-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-stone-100">
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/20 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/20 blur-3xl" />

			<div className="relative max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12 animate-fade-in">
					<div className="inline-flex items-center justify-center p-3 bg-stone-900/80 rounded-2xl border border-emerald-300/20 shadow-[0_0_30px_-10px_rgba(52,211,153,0.3)] mb-4">
						<IconTrophy
							size={48}
							className="text-emerald-300"
						/>
					</div>
					<h1 className="text-4xl sm:text-5xl font-black text-stone-100 tracking-tight">
						Global{" "}
						<span className="text-transparent bg-clip-text bg-linear-to-r from-lime-300 to-emerald-300">
							Rankings
						</span>
					</h1>
				</div>

				{/* Table */}
				<div className="bg-stone-700/50 rounded-3xl border border-stone-700 shadow-2xl backdrop-blur-md overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse min-w-[600px]">
							<thead>
								<tr className="bg-stone-950/50 border-b border-stone-800 text-stone-400 text-sm font-semibold uppercase tracking-wider">
									<th className="p-5 text-center w-24">Rank</th>
									<th className="p-5">Player</th>
									<th className="p-5 text-center">Wins</th>
									<th className="p-5 text-center">Losses</th>
									<th className="p-5 text-right pr-8">ELO</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stone-800/50">
								{/* Check the number of player */}
								{players.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="text-center py-8 text-stone-500">
											No players registered.
										</td>
									</tr>
								) : (
									players.map((player) => (
										<tr
											key={player.id}
											className="hover:bg-stone-800/40 transition-colors duration-200 group">
											<td className="p-4 text-center">
												<div
													className={classNames(
														"inline-flex items-center justify-center size-10 rounded-full border font-bold text-lg",
														getRankStyle(player.rank),
													)}>
													{player.rank <= 3 ? <IconMedal size={20} /> : player.rank}
												</div>
											</td>

											<td className="p-4">
												<div className="flex items-center gap-3">
													{/* Player image */}
													{player.avatarUrl ? (
														<img
															src={player.avatarUrl}
															alt="avatar"
															className="size-10 rounded-xl object-cover border border-stone-700"
														/>
													) : (
														<div className="flex items-center justify-center size-10 rounded-xl bg-stone-800 border border-stone-700"></div>
													)}
													<span className="font-semibold text-stone-200 text-lg">
														{/* With link, you can change the page without the fliker */}
														<Link
															to={`/history/${player.username}`}
															className="text-emerald-400 hover:underline">
															{player.username}
														</Link>
													</span>
												</div>
											</td>

											<td className="p-4 text-center">
												<span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
													{player.score.wins} W
												</span>
											</td>

											<td className="p-4 text-center">
												<span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 font-medium">
													{player.score.losses} L
												</span>
											</td>

											<td className="p-4 text-right pr-8">
												<span className="text-xl font-black text-stone-100 tracking-tight">
													{player.score.elo}
												</span>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
