import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import type { Role } from '@/shared/lib/auth/schemas';
import { useAuth } from '@/shared/lib/auth/use-auth';
import { cn } from '@/shared/lib/utils';
import { PageMeta } from '@/shared/ui/common';

import { DashboardNav } from './dashboard/DashboardNav';
import { getAvailablePages, getWidgetsForPage } from './dashboard/DashboardPages.data';

export function MemberDashboardPage() {
	const { user } = useAuth();
	const role = (user?.role ?? 'member') as Role;
	const location = useLocation();
	const navigate = useNavigate();

	const availablePages = getAvailablePages(role);

	const requestedId = location.hash.replace(/^#/, '');
	const activePage = availablePages.find((page) => page.id === requestedId) ?? availablePages[0];
	const activePageId = activePage?.id;

	useEffect(() => {
		if (!activePageId) return;
		const wanted = `#${activePageId}`;
		if (location.hash !== wanted) {
			navigate(`/member${wanted}`, { replace: true, viewTransition: true });
		}
	}, [activePageId, location.hash, navigate]);

	const widgets = activePage ? getWidgetsForPage(activePage, role) : [];

	return (
		<div className="mx-auto flex w-full max-w-350 flex-col gap-8 px-4 py-30 md:px-8">
			<PageMeta title="Member Dashboard" description="Manage your VenturePoint account." />

			<h1 className="font-title animate-shimmer mx-auto bg-[linear-gradient(135deg,var(--color-highlight)_35%,var(--color-highlight-inverted)_50%,var(--color-highlight)_65%)] bg-size-[300%_300%] bg-clip-text text-4xl leading-tight text-transparent [animation-delay:0.5s] md:whitespace-nowrap">
				Member Dashboard
			</h1>

			<DashboardNav pages={availablePages} activePageId={activePageId ?? ''} />

			{widgets.length > 0 ? (
				<div className="grid-col-1 grid gap-6">
					{widgets.map((widget) => (
						<div key={widget.id}>
							<widget.component />
						</div>
					))}
				</div>
			) : (
				<p className="text-foreground/60 text-center">No sections found.</p>
			)}
		</div>
	);
}
