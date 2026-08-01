import type { AuthAction, AuthState } from "./authTypes";

export const initialAuthState: AuthState = {
	user: null,
	isLoading: true,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
	switch (action.type) {
		case "AUTH_LOADING":
			return { ...state, isLoading: true };
		case "AUTH_SUCCESS":
			return { user: action.payload, isLoading: false };
		case "AUTH_LOGOUT":
			return { user: null, isLoading: false };
		default:
			return state;
	}
}
