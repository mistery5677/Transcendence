import {
	IconDeviceLaptop,
	IconHistory,
	IconPalette,
	IconTrophy,
	IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import type { SettingsTab } from "./Settings";

type SettingsSidebarProps = {
	activeTab: SettingsTab;
	setActiveTab: React.Dispatch<React.SetStateAction<SettingsTab>>;
	currentUsername: string;
};

function tabClass(isActive: boolean): string {
	if (isActive) {
		return "rounded-xl border border-emerald-300/30 bg-stone-700/70 px-4 py-3 text-left text-xl font-bold text-emerald-500";
	}

	return "rounded-xl px-4 py-3 text-left font-light text-stone-300 transition-colors hover:bg-stone-800/70 hover:text-stone-100";
}

export function SettingsSidebar({
	activeTab,
	setActiveTab,
	currentUsername,
}: SettingsSidebarProps) {
	const navigate = useNavigate();

	return (
		<aside className="bg-stone-950/40 p-4">
			<nav className="flex flex-col gap-2">
				<button
					type="button"
					onClick={() => setActiveTab("profile")}
					className={tabClass(activeTab === "profile")}
				>
					<div className="flex flex-row gap-2">
						<IconUser stroke={2} />
						Profile
					</div>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("account")}
					className={tabClass(activeTab === "account")}
				>
					<div className="flex flex-row gap-2">
						<IconDeviceLaptop stroke={2} />
						Account
					</div>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("board")}
					className={tabClass(activeTab === "board")}
				>
					<div className="flex flex-row gap-2">
						<IconPalette stroke={2} />
						Theme
					</div>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab("achievements")}
					className={tabClass(activeTab === "achievements")}
				>
					<div className="flex flex-row gap-2">
						<IconTrophy stroke={2} />
						Achievements
					</div>
				</button>

				<div className="my-1 border-t border-stone-800" />

				<button
					type="button"
					onClick={() => navigate(`/history/${currentUsername}`)}
					className="rounded-xl px-4 py-3 text-left font-light text-stone-300 transition-colors hover:bg-stone-800/70 hover:text-emerald-400"
				>
					<div className="flex flex-row gap-2">
						<IconHistory stroke={2} />
						Match History
					</div>
				</button>
			</nav>
		</aside>
	);
}