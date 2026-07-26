export async function updateUserName(username: string): Promise<boolean> {
	const response = await fetch("api/users/me/username", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username: username }),
	});

	if (!response.ok) {
		throw new Error("Failed to change userName.");
	}
	const data = await response.json();
	return data;
}

export async function updateEmail(email: string): Promise<boolean> {
	const response = await fetch("api/users/me/email", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: email }),
	});

	if (!response.ok) {
		throw new Error("Failed to change email.");
	}
	const data = await response.json();
	return data;
}

export async function updateBoardTheme(boardThemeVal: number): Promise<boolean> {
	let data;

	try {
		const response = await fetch("/api/users/me/board-theme", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ boardTheme: boardThemeVal }),
		});
		data = await response.json();
	} catch (error) {
		console.log(error);
		throw new Error("Failed to update board-theme.");
	}

	return data;
}

export async function updateBackGroundTheme(backgroundThemeVal: number): Promise<boolean> {
	let data;

	try {
		const response = await fetch("/api/users/me/background-theme", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ backgroundTheme: backgroundThemeVal }),
		});
		data = await response.json();
	} catch (error) {
		console.log(error);
		throw new Error("Failed to update background theme.");
	}

	return data;
}

export async function updatePassword(currentPassword: string, newPassword: string) : Promise<void> {
	const res = await fetch("/api/users/me/password", {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ currentPassword, newPassword }),
	});
	if (!res.ok) throw new Error("Failed to update password");
}

// Updates the profile image
export async function updateAvatar(picture: File) : Promise<void> {
	const formData = new FormData();
	formData.append("file", picture);

	const res = await fetch("/api/users/me/avatar", {
		method: "POST",
		credentials: "include",
		body: formData,
	});

	if (!res.ok) throw new Error("Failed to update Avatar");
}