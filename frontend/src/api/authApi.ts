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
	try {
		const response = await fetch("/api/auth/forgot-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			throw new Error("Failed to send password reset email.");
		}
 
		const data = await response.json();
		console.log("Password reset response:", data); // Log the response to see what is returned
		return data.message;
	} catch (error) {
		console.error("Failed to send password reset email:", error);
		throw error;
	}
}
