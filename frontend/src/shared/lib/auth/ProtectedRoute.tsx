import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import type { Role } from './schemas';
import { useAuth } from './use-auth';

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

/** Redirects unauthenticated users; shows a 403-style page for the wrong role. */
export function RoleRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
	const { user, isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <LoadingGate />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/join" replace />;
	}

	if (user && !roles.includes(user.role)) {
		return (
			<div className="flex w-full flex-col items-center justify-center gap-4 px-4 py-60 text-center">
				<h1 className="text-3xl font-bold">Forbidden</h1>
				<p className="text-foreground/60">You don&apos;t have permission to view this page.</p>
			</div>
		);
	}

	return <>{children}</>;
}

function LoadingGate() {
	return (
		<div className="flex w-full items-center justify-center px-4 py-60">
			<p className="text-foreground/60">Loading…</p>
		</div>
	);
}
