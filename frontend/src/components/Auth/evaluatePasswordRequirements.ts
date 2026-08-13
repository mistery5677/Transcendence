export function evaluatePasswordRequirements(password: string) {
	const hasMinLength = password.length >= 6;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	const hasUpperCase = /[A-Z]/.test(password);
	const hasSpace = /\s/.test(password);

	return {
		hasMinLength,
		hasSpecialChar,
		hasUpperCase,
		hasSpace,
	};
}
