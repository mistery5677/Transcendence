import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { authReducer, initialAuthState } from "./authReducer";
import type { AuthAction, AuthState } from "./authTypes";
import * as authApi from "../../api/authApi";

type AuthContextValue = {
	state: AuthState;
	dispatch: React.Dispatch<AuthAction>;
	login: (identity: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshMe: (options?: { silent?: boolean }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(authReducer, initialAuthState);
	const hasBootstrapped = useRef(false);

	async function refreshMe({ silent = false } = {}) {
		if (!silent)
			dispatch({ type: "AUTH_LOADING" });

		try {
			const user = await authApi.me();
			dispatch({ type: "AUTH_SUCCESS", payload: user });
		} catch {
			dispatch({ type: "AUTH_LOGOUT" });
		}
	}

	async function login(identity: string, password: string) {
		await authApi.login(identity, password);
		await refreshMe({ silent: true });
	}

	async function logout() {
		await authApi.logout();
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
