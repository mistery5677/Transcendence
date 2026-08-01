import { BoardThemeButton } from "../../../../components";
import styles from "../../style.module.css";
import { useThemeTab } from "./useThemeTab";
import {
	BOARD_THEMES,
	BACKGROUND_THEMES,
} from "../../../../constants/themes";


export function ThemeTab() {
	const { handleBoardTheme, handleBackgroundTheme } = useThemeTab();

	return (
		<div>
			<h2 className="text-2xl font-bold">Board Theme</h2>

			<div className="mt-4 mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
				{BOARD_THEMES.map((theme) => (
					<BoardThemeButton
						key={theme.id}
						onClick={handleBoardTheme(theme.id)}
						className={styles[theme.className]}
					>
						{theme.name}
					</BoardThemeButton>
				))}
			</div>

			<h2 className="text-2xl font-bold">Background Theme</h2>

			<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
		</div>
	);
}