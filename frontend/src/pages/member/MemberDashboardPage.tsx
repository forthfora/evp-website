import type { Role } from '@/shared/lib/auth/schemas';
import { useAuth } from '@/shared/lib/auth/use-auth';
import { PageMeta } from '@/shared/ui/common';

import { widgetRegistry } from './widgets';

export function MemberDashboardPage() {
	const { user } = useAuth();
	const role = (user?.role ?? 'member') as Role;

	const visibleWidgets = widgetRegistry.filter((w) => w.visibleTo.includes(role));

	return (
		<div className="flex w-full flex-col gap-8 px-4 py-30 md:px-8">
			<PageMeta title="Member Dashboard" description="Manage your VenturePoint account." />

			<h1 className="text-4xl font-bold">Member Dashboard</h1>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{visibleWidgets.length === 0 && (
					<p className="text-foreground/60 col-span-full text-center">
						No widgets available for your role.
					</p>
				)}

				{visibleWidgets.map((widget) => (
					<div key={widget.id}>
						<widget.component />
					</div>
				))}
			</div>
		</div>
	);
}
