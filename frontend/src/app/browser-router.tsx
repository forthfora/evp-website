import { createBrowserRouter } from 'react-router';

import { AboutPage } from '@/pages/about/AboutPage';
import { ContactPage } from '@/pages/contact/ContactPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { EventsPage } from '@/pages/events/EventsPage';
import { HomePage } from '@/pages/home/HomePage';
import { StartupsPage } from '@/pages/startups/StartupsPage';

import { AppLayout } from './app-layout';

export const browserRouter = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				errorElement: <ErrorPage />,
				children: [
					{ index: true, element: <HomePage /> },
					{ path: 'about', element: <AboutPage /> },
					{ path: 'startups', element: <StartupsPage /> },
					{ path: 'contact', element: <ContactPage /> },
					{ path: 'events', element: <EventsPage /> },

					// catch all for invalid pages
					{
						path: '*',
						loader: () => {
							throw new Response('Not Found', { status: 404 });
						},
					},
				],
			},
		],
	},
]);
