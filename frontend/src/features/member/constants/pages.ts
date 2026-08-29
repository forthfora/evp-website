import type { DashboardPage } from '../types';

export const DASHBOARD_PAGES: DashboardPage[] = [
	{ id: 'home', label: 'Home', widgetIds: ['welcome', 'settings'] },
	{ id: 'startups', label: 'Startup Database', widgetIds: ['startup-db'] },
	{ id: 'members', label: 'Member List', widgetIds: ['members'] },
	{ id: 'admin', label: 'Admin', widgetIds: ['admin-updates'] },
];
