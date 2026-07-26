import { toastWrapper } from "../../../../adapters/toastWrapper";
import { updatePassword } from "../../../../api/settingsApi";


export function usePasswordForm() {
	const handlePasswordChange = async (
		e: React.FormEvent<HTMLFormElement>,
	) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		const currentPassword = formData.get("currentPassword") as string | null;
		const newPassword = formData.get("newPassword") as string | null;
		const confirmPassword = formData.get("confirmPassword") as string | null;

		if (!currentPassword && !newPassword && !confirmPassword) {
			toastWrapper.warn("All fields are required.");
			return;
		}

		if (!currentPassword) {
			toastWrapper.warn("Current password is required.");
			return;
		}

		if (!newPassword) {
			toastWrapper.warn("New password is required.");
			return;
		}

		if (!confirmPassword) {
			toastWrapper.warn("Please confirm your new password.");
			return;
		}

		if (newPassword !== confirmPassword) {
			toastWrapper.warn("Password confirmation does not match.");
			return;
		}

		try {
			await updatePassword(currentPassword, newPassword);

			toastWrapper.success("Password updated successfully.");

			e.currentTarget.reset();
		} catch (error) {
			console.error(error);
			toastWrapper.error("Failed to update password.");
		}
	};

	return {
		handlePasswordChange,
	};
}