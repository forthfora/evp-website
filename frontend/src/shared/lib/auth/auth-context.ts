import { createContext } from 'react';

import type { MeResponse } from './schemas';

export interface AuthState {
	/** The current JWT access token, or null if not authenticated. */
	accessToken: string | null;
	/** The current user's profile, or null if not authenticated. */
	user: { email: string; role: string } | null;
	/** True while a silent refresh is in progress on mount. */
	isLoading: boolean;
	/** True when there is a valid access token and user profile. */
	isAuthenticated: boolean;
	/** Store tokens and user data after a successful verify-code. */
	login: (token: string, userData: MeResponse) => void;
	/** Clear auth state and notify the backend to revoke the session. */
	logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
