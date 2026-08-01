import { useState } from "react";
import { useAuth } from "../../../../context/auth";
import { verifyEmail, verifyUsername } from "../../../../api/usersApi";
import { toastWrapper } from "../../../../adapters/toastWrapper";
import { updateEmail, updateUserName } from "../../../../api/settingsApi";
import { userNameValidation } from "../../../../hooks/userNameValidation";


export function useProfileForm() {
	const { state, dispatch } = useAuth();

	const [userNameAvailable, setUserNameAvailable] = useState(true);
	const [emailAvailable, setEmailAvailable] = useState(true);

	const handleProfileChange = async (
		e: React.FormEvent<HTMLFormElement>,
	) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		const displayName = formData.get("displayName") as string | null;
		const email = formData.get("email") as string | null;

		if (email) {
			const isAvailable = await verifyEmail(email);

			if (!isAvailable) {
				toastWrapper.warn("Email already in use!");
				return;
			}

			try {
				await updateEmail(email);

				toastWrapper.success("Email updated successfully.");

				if (state.user) {
					dispatch({
						type: "AUTH_SUCCESS",
						payload: {
							...state.user,
							email,
						},
					});
				}
			} catch (error) {
				console.error(error);
			}
		}

		if (displayName) {
			if (!userNameValidation(displayName)) {
				toastWrapper.error(
					"Username must contain only letters and numbers."
				);
				return;
			}

			const isAvailable = await verifyUsername(displayName);

			if (!isAvailable) {
				toastWrapper.warn("Username already in use!");
				return;
			}

			try {
				await updateUserName(displayName);

				toastWrapper.success("Nickname changed successfully.");

				if (state.user) {
					dispatch({
						type: "AUTH_SUCCESS",
						payload: {
							...state.user,
							username: displayName,
						},
					});
				}
			} catch (error) {
				console.error(error);
			}
		}
	};

	const handleUserVerification = async (
		e: React.FocusEvent<HTMLInputElement>,
	) => {
		const value = e.target.value;

		if (!value) {
			setUserNameAvailable(true);
			return;
		}

		try {
			const isAvailable = await verifyUsername(value);
			setUserNameAvailable(isAvailable);
		} catch (error) {
			console.error(error);
			toastWrapper.warn("Failed to check username.");
		}
	};

	const handleEmailVerification = async (
		e: React.FocusEvent<HTMLInputElement>,
	) => {
		const value = e.target.value;

		if (!value) {
			setEmailAvailable(true);
			return;
		}

		try {
			const isAvailable = await verifyEmail(value);
			setEmailAvailable(isAvailable);
		} catch (error) {
			console.error(error);
			toastWrapper.warn("Failed to check email.");
		}
	};

	return {
		userNameAvailable,
		emailAvailable,
		handleProfileChange,
		handleUserVerification,
		handleEmailVerification,
	};
}