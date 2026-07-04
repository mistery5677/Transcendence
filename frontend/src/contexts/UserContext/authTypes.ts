import type { User } from "../../types/index";

export type AuthState = {
	user: User | null;
	isLoading: boolean;
};

export type AuthAction = { type: "AUTH_LOADING" } | { type: "AUTH_SUCCESS"; payload: User } | { type: "AUTH_LOGOUT" };
