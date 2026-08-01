import { ProfileAchievements } from "../Achievements";

export function AchievementsTab() {
	return (
		<div>
			<h2 className="text-2xl font-bold">Achievements</h2>

			<div className="mt-4">
				<ProfileAchievements />
			</div>
		</div>
	);
}