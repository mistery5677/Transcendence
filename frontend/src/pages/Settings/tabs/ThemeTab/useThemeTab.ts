import { toastWrapper } from "../../../../adapters/toastWrapper";
import { updateBackGroundTheme, updateBoardTheme } from "../../../../api/settingsApi";
import { useAuth } from "../../../../context/auth";


export function useThemeTab() {
	const { state, dispatch } = useAuth();

	const handleBoardTheme =
		(themeId: 1 | 2 | 3) => async () => {
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
		};

	const handleBackgroundTheme =
		(backgroundId: 1 | 2 | 3 | 4 | 5) => async () => {
			try {
				await updateBackGroundTheme(backgroundId);

				toastWrapper.success(
					"Background theme updated successfully.",
				);

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
				console.error(error);
				toastWrapper.error("Failed to update background.");
			}
		};

	return {
		handleBoardTheme,
		handleBackgroundTheme,
	};
}