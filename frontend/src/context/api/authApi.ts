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