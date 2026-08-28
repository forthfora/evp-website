import { createBrowserRouter } from 'react-router';

import { ErrorPage } from '@/components/feedback/ErrorPage';
import { AboutPage } from '@/features/about';
import { AuthPage } from '@/features/auth';
import { ContactPage } from '@/features/contact';
import { EventsPage } from '@/features/events';
import { HomePage } from '@/features/home';
import { MemberDashboardPage } from '@/features/member';
import { StartupsPage } from '@/features/startups';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';

import { AppLayout } from './AppLayout';

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
