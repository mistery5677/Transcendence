import { ProfileHeader, ProfileOverview } from "../../../../components";
import type { ProfileStatsVM } from "../../../../models/profileStats";
import { userToProfileStats } from "../../../../mappers/userToProfileStats";
import type { Match, PublicProfile } from "../../../../types";
import { useEffect, useState } from "react";
import { getHistoryByUsername } from "../../../../api/matchesApi";
import { getPublicProfile } from "../../../../api/usersApi";
import { useAuth } from "../../../../context/auth";

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

			<div className="mt-8">
				<ProfileOverview
					stats={profileStats}
					recentMatches={history.slice(0, 3)}
				/>
			</div>
		</main>
	);
}
