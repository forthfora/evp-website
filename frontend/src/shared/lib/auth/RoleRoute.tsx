import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import type { Role } from './schemas';
import { useAuth } from './use-auth';

interface RoleRouteProps {
	roles: Role[];
	children: ReactNode;
}

/** Redirects to /join if unauthenticated, or renders a 403 error page
 * if the user's role is not in the allowed list. */
export function RoleRoute({ roles, children }: RoleRouteProps) {
	const { isAuthenticated, isLoading, user } = useAuth();

	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/join" replace />;
	}

	if (!user || !roles.includes(user.role as Role)) {
		return (
			<div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-4 py-60 text-center">
				<h1 className="text-8xl font-bold">403</h1>
				<h2 className="text-2xl font-semibold">Forbidden</h2>
				<h2 className="text-foreground/60 max-w-md">
					We're sorry, you don't have permission to access this page.
				</h2>
				<p>If you believe this is a mistake, please contact the society committee.</p>
			</div>
		);
	}

	return <>{children}</>;
}
