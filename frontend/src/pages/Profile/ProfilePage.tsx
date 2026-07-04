import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/UserContext";
import { ProfileTabs, ProfileHeader, ProfileOverview, MatchHistory, ProfileStats } from "../../components";
import { userToProfileStats } from "../../mappers/userToProfileStats";
import type { ProfileStatsVM } from "../../models/profileStats";
import type { Match } from "../../types/match";
import { getHistoryByUsername, getMatchHistory } from "../../api/matches";
import { getPublicProfile } from "../../api/users";
import type { PublicProfile } from "../../types";

export function ProfilePage() {
	
	const [history, setHistory] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);
	const { username } = useParams<{ username: string }>();
	const [user, setUser] = useState<PublicProfile | null>(null);

	const { state } = useAuth(); // Get the logged user
	const myUsername = state?.user?.username;

	// const user = state?.user; // Get the logged user

	const targetUserName = username || "admin"; // Default to "admin" if no username is provided

	useEffect(() => {
		document.title = "Profile | 42 Transcendence";

		const fetchHistory = async () => {
			if (!targetUserName) {
				setLoading(false);
				return;
			}
			setLoading(true); // Loading system
			try {
				let data;
				if (username) {
					data = await getHistoryByUsername(targetUserName);
					console.log("Fetched history for user:", data);
				} else {
					data = await getMatchHistory();
				}
				setHistory(data);
			} catch (error) {
				console.error("Failed to load the history of the player: ", error);
			} finally {
				setLoading(false);
			}
		};

		const fetchUserData = async () => {
			try {
				const data = await getPublicProfile(targetUserName);
				setUser(data);
			} catch (error) {
				console.error("Failed to load the user data: ", error);
			}
		};

		fetchHistory();
		fetchUserData();
	}, [username, myUsername, targetUserName]);

	const [tab, setTab] = useState<"overview" | "history" | "stats">("overview");

	const profileStats: ProfileStatsVM = userToProfileStats(user);

	return (
		<>
			<main className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden px-4 py-10 text-stone-100 bg-stone-900">
				<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/20 blur-3xl" />
				<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/20 blur-3xl" />

				<div className="relative mx-auto w-full lg:w-[60%] rounded-3xl border border-stone-200/20 bg-stone-200/10 p-8 shadow-[0_30px_80px_rgba(28,25,23,0.7)] backdrop-blur-2xl">
					<ProfileHeader user={user} />
					<ProfileTabs
						activeTab={tab}
						onChange={setTab}
					/>
					{tab === "overview" && (
						<div>
							<ProfileOverview
								stats={profileStats}
								recentMatches={history.slice(0, 3)}
							/>
						</div>
					)}

					{tab === "history" && <MatchHistory matches={history} />}

					{tab === "stats" && (
						<div>
							<ProfileStats stats={profileStats} history={history} />
						</div>
					)}
				</div>
			</main>
		</>
	);
}
