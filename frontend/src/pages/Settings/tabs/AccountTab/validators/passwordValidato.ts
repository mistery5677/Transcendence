export type PasswordValidationResult = {
	valid: boolean;
	message?: string;
};

export function validatePassword(
	currentPassword: string | null,
	newPassword: string | null,
	confirmPassword: string | null,
): PasswordValidationResult {
	if (!currentPassword && !newPassword && !confirmPassword) {
		return {
			valid: false,
			message: "All fields are required.",
		};
	}

	if (!currentPassword) {
		return {
			valid: false,
			message: "Current password is required.",
		};
	}

	if (!newPassword) {
		return {
			valid: false,
			message: "New password is required.",
		};
	}

	if (!confirmPassword) {
		return {
			valid: false,
			message: "Please confirm your new password.",
		};
	}

	if (newPassword !== confirmPassword) {
		return {
			valid: false,
			message: "Password confirmation does not match.",
		};
	}

	return {
		valid: true,
	};
}