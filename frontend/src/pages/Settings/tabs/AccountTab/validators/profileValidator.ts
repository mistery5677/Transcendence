import { userNameValidation } from "../../../../../hooks/userNameValidation";

export type ProfileValidationResult = {
	valid: boolean;
	message?: string;
};

export function validateDisplayName(
	displayName: string | null,
): ProfileValidationResult {
	if (!displayName) {
		return { valid: true };
	}

	if (!userNameValidation(displayName)) {
		return {
			valid: false,
			message: "Username must contain only letters and numbers.",
		};
	}

	return {
		valid: true,
	};
}

export function validateEmail(email: string | null): ProfileValidationResult {
	if (!email) {
		return { valid: true };
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
		return {
			valid: false,
			message: "Please enter a valid email address.",
		};
	}

	return {
		valid: true,
	};
}