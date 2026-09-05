import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { useAuth } from '../hooks/use-auth';

/** Redirects unauthenticated users to `/join`; renders children otherwise. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <LoadingGate />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/join" replace />;
	}

	return <>{children}</>;
}

function LoadingGate() {
	return (
		<div className="flex w-full items-center justify-center px-4 py-60">
			<p className="text-foreground/60">Loading...</p>
		</div>
	);
}
