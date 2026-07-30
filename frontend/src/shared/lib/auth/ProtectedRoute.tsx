import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { useAuth } from './use-auth';

interface ProtectedRouteProps {
	children: ReactNode;
}

/** Redirects to /join if the user is not authenticated. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/join" replace />;
	}

	return <>{children}</>;
}
