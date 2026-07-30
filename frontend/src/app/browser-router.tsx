import { createBrowserRouter } from 'react-router';

import { AboutPage } from '@/pages/about/AboutPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ContactPage } from '@/pages/contact/ContactPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { EventsPage } from '@/pages/events/EventsPage';
import { HomePage } from '@/pages/home/HomePage';
import { MemberDashboardPage } from '@/pages/member/MemberDashboardPage';
import { StartupsPage } from '@/pages/startups/StartupsPage';
import { ProtectedRoute } from '@/shared/lib/auth/ProtectedRoute';

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
					{ path: 'join', element: <AuthPage /> },
					{
						path: 'member',
						element: (
							<ProtectedRoute>
								<MemberDashboardPage />
							</ProtectedRoute>
						),
					},

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
