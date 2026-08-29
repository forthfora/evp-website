import type { Role } from '@/features/auth';

import { type Widget, widgetRegistry } from '../components/widgets';
import { DASHBOARD_PAGES } from '../constants/pages';
import type { DashboardPage } from '../types';

export function getWidgetsForPage(page: DashboardPage, role: Role): Widget[] {
	return page.widgetIds
		.map((id) => widgetRegistry.find((widget) => widget.id === id))
		.filter((widget): widget is Widget => widget !== undefined && widget.visibleTo.includes(role));
}

export function getAvailablePages(role: Role): DashboardPage[] {
	return DASHBOARD_PAGES.filter((page) => getWidgetsForPage(page, role).length > 0);
}
