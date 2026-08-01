/* eslint-disable react-refresh/only-export-components -- the useAuth hook must live with the provider */
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { browserRouter } from '@/app/browser-router';
import { setUnauthorizedHandler } from '@/shared/lib/api';

import { fetchMe, logout as logoutRequest } from './api';
import type { MeResponse } from './schemas';

interface AuthContextValue {
	/** The authenticated user's profile, or `null` when signed out. */
	user: MeResponse | null;
	isAuthenticated: boolean;
	/** True while the initial session hydrate (`GET /api/accounts/me`) runs. */
	isLoading: boolean;
	/** Re-fetch the profile after login (the session cookie is the credential). */
	login: () => Promise<void>;
	/** Call the backend logout endpoint, then clear local state. */
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<MeResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		setUnauthorizedHandler(() => setUser(null));

		(async () => {
			try {
				const me = await fetchMe();
				if (!cancelled) setUser(me);
			} catch {
				// No active session (or expired), stay logged out.
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		})();

		return () => {
			cancelled = true;
			setUnauthorizedHandler(null);
		};
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			isAuthenticated: user !== null,
			isLoading,
			login: async () => {
				const me = await fetchMe();
				setUser(me);
			},
			logout: async () => {
				try {
					await logoutRequest();
				} finally {
					setUser(null);
					browserRouter.navigate('/', { viewTransition: true });
				}
			},
		}),
		[user, isLoading],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
	return ctx;
}
