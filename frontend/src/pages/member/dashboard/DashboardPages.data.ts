import type { Role } from '@/shared/lib/auth/schemas';

import { type Widget, widgetRegistry } from '../widgets';

export interface DashboardPage {
	/** Hash fragment used in the URL, e.g. `home` in `/member#home`. */
	id: string;
	/** Label shown on the navigation button. */
	label: string;
	/** Ids of the widgets (from the widget registry) rendered on this page. */
	widgetIds: string[];
}

export const DASHBOARD_PAGES: DashboardPage[] = [
	{ id: 'home', label: 'Home', widgetIds: ['welcome', 'settings'] },
	{ id: 'startups', label: 'Startup Database', widgetIds: ['startup-db'] },
	{ id: 'members', label: 'Member List', widgetIds: ['members'] },
	{ id: 'admin', label: 'Admin', widgetIds: ['admin-updates'] },
];

export function getWidgetsForPage(page: DashboardPage, role: Role): Widget[] {
	return page.widgetIds
		.map((id) => widgetRegistry.find((widget) => widget.id === id))
		.filter((widget): widget is Widget => widget !== undefined && widget.visibleTo.includes(role));
}

export function getAvailablePages(role: Role): DashboardPage[] {
	return DASHBOARD_PAGES.filter((page) => getWidgetsForPage(page, role).length > 0);
}
