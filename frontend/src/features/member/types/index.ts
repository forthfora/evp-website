export interface DashboardPage {
	/** Hash fragment used in the URL, e.g. `home` in `/member#home`. */
	id: string;
	/** Label shown on the navigation button. */
	label: string;
	/** Ids of the widgets (from the widget registry) rendered on this page. */
	widgetIds: string[];
}
