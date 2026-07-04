import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { authReducer, initialAuthState } from "./authReducer";
import type { AuthAction, AuthState } from "./authTypes";
import type { User } from "../../types";

type AuthContextValue = {
	state: AuthState;
	dispatch: React.Dispatch<AuthAction>;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshMe: (options?: { silent?: boolean }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(authReducer, initialAuthState);
	const hasBootstrapped = useRef(false);

	async function refreshMe({ silent = false } = {}) {
		if (!silent) dispatch({ type: "AUTH_LOADING" });

		try {
			const res = await fetch("/api/auth/me", {
				method: "GET",
				credentials: "include",
			});

			if (!res.ok) {
				dispatch({ type: "AUTH_LOGOUT" });
				return;
			}

			const user: User = await res.json();
			dispatch({ type: "AUTH_SUCCESS", payload: user });
		} catch {
			dispatch({ type: "AUTH_LOGOUT" });
		}
	}

	async function login(identity: string, password: string) {
		const loginRes = await fetch("/api/auth/login", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ identity, password }),
		});

		if (!loginRes.ok) {
			throw new Error("Login failed");
		}

		await refreshMe({ silent: true });
	}

	async function logout() {
		await fetch("/api/auth/logout", {
			method: "POST",
			credentials: "include",
		});

		dispatch({ type: "AUTH_LOGOUT" });
	}

	useEffect(() => {
		if (hasBootstrapped.current) {
			return;
		}

		hasBootstrapped.current = true;
		refreshMe();
	}, []);

	const value = useMemo(() => ({ state, dispatch, login, logout, refreshMe }), [state]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
