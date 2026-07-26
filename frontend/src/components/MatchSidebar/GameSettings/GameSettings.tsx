import { toastWrapper } from "../../../adapters/toastWrapper";
import { updateBackGroundTheme, updateBoardTheme } from "../../../api/settingsApi";
import { useAuth } from "../../../context/auth";
import { BoardThemeButton } from "../../index";
import styles from "./style.module.css";

export function GameSettings() {
	const { state, dispatch } = useAuth();
	const currentTheme = state.user?.backgroundTheme;
	const boardTheme = state.user?.boardTheme;

	const handleBoardTheme = (themeId: 1 | 2 | 3) => async () => {
		try {
			await updateBoardTheme(themeId);
			toastWrapper.success("Board theme update successfully.");
			if (state.user) {
				dispatch({ type: "AUTH_SUCCESS", payload: { ...state.user, boardTheme: themeId } });
			}
		} catch (error) {
			toastWrapper.error("Error updating board theme.");
		}
	};

	const handleBackgroundTheme = (backgroundID: 1 | 2 | 3 | 4 | 5) => async () => {
		try {

			console.log("ID: ++++++ ", backgroundID);
			await updateBackGroundTheme(backgroundID);

			toastWrapper.success("Background theme update successfully.");

			if (state.user) {
				dispatch({ type: "AUTH_SUCCESS", payload: { ...state.user, backgroundTheme: backgroundID } });
			}
		} catch (error) {
			toastWrapper.error("Error changing background.");
		}
	};

	return (
		<div className="w-full rounded-lg border border-stone-700/60 bg-stone-900/40 p-3 sm:p-4">
			{/* Boart Theme Section */}
			<section className="mb-4">
				<div className="mb-3 border-b border-stone-700/70 pb-2 text-center">
					<h2 className="text-md font-extrabold tracking-wide text-stone-100">Board Theme</h2>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
					<BoardThemeButton
						onClick={handleBoardTheme(1)}
						className={`${styles["custom-button-forest"]} ${
							boardTheme === 1 ? "border-emerald-400" : ""
						}`}>
						Forest
					</BoardThemeButton>
					<BoardThemeButton
						onClick={handleBoardTheme(2)}
						className={`${styles["custom-button-classic"]}`}>
						Classic
					</BoardThemeButton>
					<BoardThemeButton
						onClick={handleBoardTheme(3)}
						className={`${styles["custom-button-midnight"]}`}>
						Midnight
					</BoardThemeButton>
				</div>
			</section>
			{/* BackGround Theme Section */}
			<section>
				<div className="mb-3 border-b border-stone-700/70 pb-2 text-center">
					<h2 className="text-md tracking-wide text-stone-100 font-extrabold">Background Theme</h2>
				</div>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<BoardThemeButton
						onClick={handleBackgroundTheme(1)}
						className={`${styles["custom-button-forest"]}`}>
						Chess
					</BoardThemeButton>
					<BoardThemeButton
						onClick={handleBackgroundTheme(2)}
						className={`${styles["custom-button-classic"]}`}>
						Cats
					</BoardThemeButton>
					<BoardThemeButton
						onClick={handleBackgroundTheme(3)}
						className={`${styles["custom-button-midnight"]}`}>
						Sky
					</BoardThemeButton>
					<BoardThemeButton
						onClick={handleBackgroundTheme(4)}
						className={`${styles["custom-button-classic"]}`}>
						Penguin
					</BoardThemeButton>
					<BoardThemeButton
						onClick={handleBackgroundTheme(5)}
						className={`${styles["custom-button-forest"]}`}>
						Standard
					</BoardThemeButton>
				</div>
			</section>
		</div>
	);
}
