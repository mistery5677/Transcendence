import type { currentTabOpt } from "../MatchSidebar";
import { IconSettings } from "@tabler/icons-react";

type GameSettingsButtonProps = {
	toggleMenu: (value: currentTabOpt) => void;
};

export function GameSettingsButton({ toggleMenu }: GameSettingsButtonProps) {
	return (
		<>
			<button
				type="button"
				title="Game Settings"
				aria-label="Game Settings"
				onClick={() => toggleMenu("settings")}
				className={`border  border-stone-700 flex h-full w-full items-center justify-center rounded-xl bg-button-stone
								text-stone-300 transition-all duration-200 shadow-md hover:bg-stone-700 hover:text-stone-100
								hover:border-stone-500 active:scale-[0.98]`}>
				<IconSettings stroke={2} />
			</button>
		</>
	);
}
