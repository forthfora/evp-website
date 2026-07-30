import { useContext } from 'react';

import { AuthContext, type AuthState } from './auth-context.ts';

// helper that wraps useContext for AuthContext
export function useAuth(): AuthState {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return ctx as AuthState;
}
