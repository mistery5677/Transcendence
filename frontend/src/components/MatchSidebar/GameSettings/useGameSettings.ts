import { toastWrapper } from "../../../adapters/toastWrapper";
import { updateBackGroundTheme, updateBoardTheme } from "../../../api/settingsApi";
import { useAuth } from "../../../context/auth";

export function useGameSettings() {
	const { state, dispatch } = useAuth();

	const handleBoardTheme = (themeId: 1 | 2 | 3) => async () => {
		try {
			await updateBoardTheme(themeId);
			toastWrapper.success("Board theme updated successfully.");

			if (state.user) {
				dispatch({
					type: "AUTH_SUCCESS",
					payload: {
						...state.user,
						boardTheme: themeId,
					},
				});
			}
		} catch (error) {
			toastWrapper.error("Error updating board theme.");
		}
	};

	const handleBackgroundTheme = (backgroundId: 1 | 2 | 3 | 4 | 5) => async () => {
		try {
			await updateBackGroundTheme(backgroundId);
			toastWrapper.success("Background theme updated successfully.");
			if (state.user) {
				dispatch({
					type: "AUTH_SUCCESS",
					payload: {
						...state.user,
						backgroundTheme: backgroundId,
					},
				});
			}
		} catch (error) {
			toastWrapper.error("Error updating background theme.");
		}
	};

	return {
		handleBoardTheme,
		handleBackgroundTheme,
	};
}
