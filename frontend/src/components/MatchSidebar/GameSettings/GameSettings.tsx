import { BACKGROUND_THEMES, BOARD_THEMES } from "../../../constants";
import { BoardThemeButton } from "../../index";
import styles from "./style.module.css";
import { useGameSettings } from "./useGameSettings";

export function GameSettings() {

	const { handleBoardTheme, handleBackgroundTheme } = useGameSettings();

	return (
		<div className="w-full rounded-lg border border-stone-700/60 bg-stone-900/40 p-3 sm:p-4">
			{/* Boart Theme Section */}
			<section className="mb-4">
				<div className="mb-3 border-b border-stone-700/70 pb-2 text-center">
					<h2 className="text-md font-extrabold tracking-wide text-stone-100">Board Theme</h2>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
					{BOARD_THEMES.map((theme) => (
						<BoardThemeButton
							key={theme.id}
							onClick={handleBoardTheme(theme.id)}
							className={styles[theme.className]}>
							{theme.name}
						</BoardThemeButton>
					))}
				</div>
			</section>
			{/* BackGround Theme Section */}
			<section>
				<div className="mb-3 border-b border-stone-700/70 pb-2 text-center">
					<h2 className="text-md tracking-wide text-stone-100 font-extrabold">Background Theme</h2>
				</div>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					{BACKGROUND_THEMES.map((theme) => (
					<BoardThemeButton
						key={theme.id}
						onClick={handleBackgroundTheme(theme.id)}
						className={styles[theme.className]}
					>
						{theme.name}
					</BoardThemeButton>
				))}
				</div>
			</section>
		</div>
	);
}
