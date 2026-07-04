type Tab = "overview" | "history" | "stats";

type Props = {
	activeTab: Tab;
	onChange: (tab: Tab) => void;
};

const tabs: { key: Tab; label: string }[] = [
	{ key: "overview", label: "Overview" },
	{ key: "history", label: "Match History" },
	{ key: "stats", label: "Statistics" },
];

export function ProfileTabs({ activeTab, onChange }: Props) {
	return (
		<div className="w-full flex justify-center mb-8">
			<div className="flex gap-2 bg-stone-900/40 border border-white/10 rounded-xl p-2 backdrop-blur-md">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.key;

					return (
						<button
							key={tab.key}
							onClick={() => onChange(tab.key)}
							className={`
								px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
								${isActive ? "bg-emerald-500/20 text-emerald-300 shadow-md" : "text-stone-300 hover:text-white hover:bg-stone-800/40"}
							`}>
							{tab.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
