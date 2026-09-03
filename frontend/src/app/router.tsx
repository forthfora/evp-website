import { createBrowserRouter } from 'react-router';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

import { AppLayout } from './AppLayout';
import { AboutPage } from './routes/AboutPage';
import { AuthPage } from './routes/AuthPage';
import { ContactPage } from './routes/ContactPage';
import { ErrorPage } from './routes/ErrorPage';
import { EventsPage } from './routes/EventsPage';
import { HomePage } from './routes/HomePage';
import { MemberDashboardPage } from './routes/MemberDashboardPage';
import { StartupsPage } from './routes/StartupsPage';

export const router = createBrowserRouter([
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
