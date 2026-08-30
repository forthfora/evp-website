import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { PageMeta } from '@/components/ui';
import type { Role } from '@/features/auth/api/schemas';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { DashboardNav, getAvailablePages, getWidgetsForPage } from '@/features/member';

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

	const [isFirstEntry] = useState(() => {
		if (typeof window === 'undefined') return true;
		return !window.sessionStorage.getItem('member-dashboard-visited');
	});

	useEffect(() => {
		window.sessionStorage.setItem('member-dashboard-visited', '1');
	}, []);

	const widgets = activePage ? getWidgetsForPage(activePage, role) : [];

	return (
		<div className="mx-auto flex w-full max-w-350 flex-col gap-8 px-4 py-30 md:px-8">
			<PageMeta title="Member Dashboard" description="Manage your VenturePoint account." />

			<motion.h1
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
				className="font-title animate-shimmer mx-auto bg-[linear-gradient(135deg,var(--color-highlight)_35%,var(--color-highlight-inverted)_50%,var(--color-highlight)_65%)] bg-size-[300%_300%] bg-clip-text text-4xl leading-tight text-transparent [animation-delay:0.5s] md:whitespace-nowrap"
			>
				Member Dashboard
			</motion.h1>

			<DashboardNav pages={availablePages} activePageId={activePageId ?? ''} />

			{widgets.length > 0 ? (
				<AnimatePresence mode="wait">
					<motion.div
						key={activePageId}
						exit={{ opacity: 0, y: -30 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
						className="grid grid-cols-1 gap-6"
					>
						{widgets.map((widget, i) => (
							<motion.div
								key={widget.id}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 1 }}
								transition={{
									duration: 0.5,
									ease: 'easeOut',
									delay: (isFirstEntry ? 0.4 : 0.0) + 0.1 * i,
								}}
							>
								<widget.component />
							</motion.div>
						))}
					</motion.div>
				</AnimatePresence>
			) : (
				<p className="text-foreground-muted text-center">No sections found.</p>
			)}
		</div>
	);
}
