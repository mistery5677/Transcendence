import { Profile } from "./Profile";

export function ProfileTab() {
	return (
		<div>
			<div className="mb-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 text-sm text-blue-300/90">
				Profile statistics and records are accessible via your public showcase page.
			</div>

			<Profile />
		</div>
	);
}