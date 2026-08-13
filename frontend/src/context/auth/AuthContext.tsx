import { useEffect, useMemo, useReducer, useRef, useCallback } from "react";
import { authReducer, initialAuthState } from "./authReducer";
import * as authApi from "../../api/authApi";
import { AuthContext, type AuthContextValue } from "./authContextValue";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(authReducer, initialAuthState);
	const hasBootstrapped = useRef(false);

	const refreshMe = useCallback(async function refreshMe({ silent = false } = {}) {
		if (!silent) dispatch({ type: "AUTH_LOADING" });

		try {
			const user = await authApi.me();
			dispatch({ type: "AUTH_SUCCESS", payload: user });
		} catch {
			dispatch({ type: "AUTH_LOGOUT" });
		}
	}, []);

	const login = useCallback(
		async function login(identity: string, password: string) {
			await authApi.login(identity, password);
			await refreshMe({ silent: true });
		},
		[refreshMe],
	);

	const logout = useCallback(async function logout() {
		await authApi.logout();
		dispatch({ type: "AUTH_LOGOUT" });
	}, []);

	useEffect(() => {
		if (hasBootstrapped.current) {
			return;
		}

		hasBootstrapped.current = true;
		refreshMe();
	}, [refreshMe]);

	const value = useMemo<AuthContextValue>(
		() => ({ state, dispatch, login, logout, refreshMe }),
		[state, login, logout, refreshMe],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
