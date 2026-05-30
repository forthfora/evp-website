import { createBrowserRouter } from 'react-router';

import { AboutPage } from '@/pages/about/AboutPage';
import { ContactPage } from '@/pages/contact/ContactPage';
import ErrorPage from '@/pages/error/ErrorPage';
import { EventsPage } from '@/pages/events/EventsPage';
import { HomePage } from '@/pages/home/HomePage';
import { PartnersPage } from '@/pages/partners/PartnersPage';
import { StartupsPage } from '@/pages/startups/StartupsPage';

import { AppLayout } from './app-layout';

export const browserRouter = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'about',
				element: <AboutPage />,
			},
			{
				path: 'startups',
				element: <StartupsPage />,
			},
			{
				path: 'contact',
				element: <ContactPage />,
			},
			{
				path: 'partners',
				element: <PartnersPage />,
			},
			{
				path: 'events',
				element: <EventsPage />,
			},
		],
	},
]);
