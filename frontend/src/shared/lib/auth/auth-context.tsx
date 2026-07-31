import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext, type AuthState } from './auth-context';
import { setAuthFetchToken } from './fetch';
import type { MeResponse } from './schemas';

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [user, setUser] = useState<{ email: string; role: string } | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Silent refresh on mount: try to use the HttpOnly refresh cookie
	useEffect(() => {
		let cancelled = false;

		async function trySilentRefresh() {
			try {
				const refreshResp = await fetch('/api/auth/refresh/', {
					method: 'POST',
				});

				if (!refreshResp.ok) {
					// No valid refresh cookie — stay unauthenticated
					return;
				}

				const { access } = (await refreshResp.json()) as {
					access: string;
				};

				if (cancelled) return;
				setAccessToken(access);

				// Now hydrate the user profile
				const meResp = await fetch('/api/accounts/me', {
					headers: { Authorization: `Bearer ${access}` },
				});

				if (!meResp.ok) {
					// Token is invalid — clear it
					setAccessToken(null);
					return;
				}

				const meData = (await meResp.json()) as MeResponse;
				if (cancelled) return;
				setUser({ email: meData.email, role: meData.role });
			} catch {
				// Network error — stay unauthenticated
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		void trySilentRefresh();

		return () => {
			cancelled = true;
		};
	}, []);

	// Keep the authFetch token in sync with the access token
	useEffect(() => {
		setAuthFetchToken(accessToken);
	}, [accessToken]);

	const login = useCallback((token: string, userData: MeResponse) => {
		setAccessToken(token);
		setUser({ email: userData.email, role: userData.role });
	}, []);

	const logout = useCallback(() => {
		// Notify backend to revoke the refresh token
		fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
			// Best-effort — clear local state regardless
		});
		setAccessToken(null);
		setUser(null);
	}, []);

	const value = useMemo<AuthState>(
		() => ({
			accessToken,
			user,
			isLoading,
			isAuthenticated: accessToken !== null && user !== null,
			login,
			logout,
		}),
		[accessToken, user, isLoading, login, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
