export async function login(identity: string, password: string) {
	const res = await fetch("/api/auth/login", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ identity, password }),
	});

	if (!res.ok) {
		throw new Error("Login failed");
	}
}

// Function to sign up connecting to api
export async function signupUser(userData: Record<string, any>): Promise<boolean> {
	const response = await fetch("/api/auth/signup", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userData),
	});

	if (!response.ok) {
		throw new Error("Failed to sign up user.");
	}

	const data = await response.json();
	return data;
}

export async function me() {
	const res = await fetch("/api/auth/me", {
		credentials: "include",
	});

	if (!res.ok) {
		throw new Error("Unauthorized");
	}

	return res.json();
}

export async function logout() {
	await fetch("/api/auth/logout", {
		method: "POST",
		credentials: "include",
	});
}

export async function forgotPassword(email: string): Promise<string> {
	const response = await fetch("/api/password-reset/forgot", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email }),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.message ?? "Failed to send password reset email."
		);
	}

	return data.message;
}

export async function resetPassword(
	token: string,
	password: string,
): Promise<string> {
	const response = await fetch("/api/password-reset", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ token, password }),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.message ?? "Failed to reset password."
		);
	}

	return data.message;
}