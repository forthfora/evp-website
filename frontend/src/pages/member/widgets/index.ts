import type { Role } from '@/shared/lib/auth/schemas';

import { AdminUpdatesWidget } from './AdminUpdatesWidget';
import { MembersWidget } from './MembersWidget';
import { SettingsWidget } from './SettingsWidget';
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
		title: 'welcome',
		visibleTo: ['member', 'scout', 'committee', 'admin'],
		component: WelcomeWidget,
	},
	{
		id: 'startup-db',
		title: 'startup database',
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
		title: 'send update',
		visibleTo: ['admin'],
		component: AdminUpdatesWidget,
	},
	{
		id: 'settings',
		title: 'account settings',
		visibleTo: ['member', 'scout', 'committee', 'admin'],
		component: SettingsWidget,
	},
];
