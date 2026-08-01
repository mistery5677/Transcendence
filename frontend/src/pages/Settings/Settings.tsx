import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth";

import { SettingsSidebar } from "./SettingsSidebar";
import { AccountTab } from "./tabs/AccountTab/AccountTab";
import { ProfileTab } from "./tabs/ProfileTab/ProfileTab";
import { ThemeTab } from "./tabs/ThemeTab/ThemeTab";
import { AchievementsTab } from "./tabs/AchievementsTab";

export type SettingsTab =
	| "profile"
	| "account"
	| "board"
	| "achievements";

type SettingsProps = {
	tabOpt: SettingsTab;
};

export function Settings({ tabOpt }: SettingsProps) {
	const [activeTab, setActiveTab] = useState<SettingsTab>(tabOpt);

	const { state } = useAuth();

	useEffect(() => {
		document.title = "Settings | 42 Transcendence";
	}, []);

	const currentUsername = state.user?.username ?? "me";

	return (
		<main className="relative min-h-screen overflow-hidden bg-stone-900 py-16">
			<div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-stone-400/20 blur-3xl" />
			<div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-stone-600/20 blur-3xl" />

			<div className="relative mx-2 max-w-4xl rounded-3xl border border-stone-200/20 bg-stone-200/10 p-8 text-stone-100 shadow-[0_30px_80px_rgba(28,25,23,0.7)] backdrop-blur-2xl sm:mx-auto">
				<header className="mb-8">
					<h1 className="text-4xl font-extrabold tracking-tight">
						⚙️ Settings
					</h1>

					<p className="mt-2 text-sm text-stone-400">
						Manage your profile, account security, and game
						preferences.
					</p>
				</header>

				<div className="overflow-hidden rounded-2xl border border-stone-700/80 bg-sidebar-bg shadow-[0_20px_60px_-30px_rgba(15,23,42,0.85)]">
					<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr]">
						<SettingsSidebar
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							currentUsername={currentUsername}
						/>

						<section className="relative border-t border-stone-700/70 bg-stone-950/20 p-6 lg:border-t-0">
							<div className="absolute top-5 bottom-5 left-0 hidden w-px bg-stone-700/70 lg:block" />

							{activeTab === "profile" && <ProfileTab />}

							{activeTab === "account" && <AccountTab />}

							{activeTab === "board" && <ThemeTab />}

							{activeTab === "achievements" && (
								<AchievementsTab />
							)}
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}