import type { Role } from '@/shared/lib/auth/schemas';

import { AdminUpdatesWidget } from './AdminUpdatesWidget';
import { MembersWidget } from './MembersWidget';
import { StartupDatabaseWidget } from './StartupDatabaseWidget';
import { WelcomeWidget } from './WelcomeWidget';

export interface Widget {
	id: string;
	title: string;
	visibleTo: Role[];
	component: React.ComponentType;
}

// widgets that are displayed on the member dashboard. These are keyed by user.
// for the curious, visibleTo is secure since requests are authenticated on the backend anyways
export const widgetRegistry: Widget[] = [
	{
		id: 'welcome',
		title: 'Welcome',
		visibleTo: ['member', 'scout', 'committee', 'admin'],
		component: WelcomeWidget,
	},
	{
		id: 'startup-db',
		title: 'Startup Database',
		visibleTo: ['scout', 'committee', 'admin'],
		component: StartupDatabaseWidget,
	},
	{
		id: 'members',
		title: 'Members',
		visibleTo: ['committee', 'admin'],
		component: MembersWidget,
	},
	{
		id: 'admin-updates',
		title: 'Send Update',
		visibleTo: ['admin'],
		component: AdminUpdatesWidget,
	},
];
