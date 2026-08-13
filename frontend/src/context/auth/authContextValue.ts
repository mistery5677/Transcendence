import { createContext, type Dispatch } from "react";
import type { AuthAction, AuthState } from "./authTypes";

export type AuthContextValue = {
	state: AuthState;
	dispatch: Dispatch<AuthAction>;
	login: (identity: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshMe: (options?: { silent?: boolean }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
