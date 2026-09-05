import { createBrowserRouter } from 'react-router';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

import AppLayout from './AppLayout';
import About from './routes/About';
import Auth from './routes/Auth';
import Contact from './routes/Contact';
import Error from './routes/Error';
import Events from './routes/Events';
import Home from './routes/Home';
import MemberDashboard from './routes/MemberDashboard';
import Privacy from './routes/Privacy';
import Startups from './routes/Startups';
import Terms from './routes/Terms';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		errorElement: <Error />,
		children: [
			{
				errorElement: <Error />,
				children: [
					{ index: true, element: <Home /> },
					{ path: 'about', element: <About /> },
					{ path: 'startups', element: <Startups /> },
					{ path: 'contact', element: <Contact /> },
					{ path: 'events', element: <Events /> },
					{ path: 'join', element: <Auth /> },
					{ path: 'privacy', element: <Privacy /> },
					{ path: 'terms', element: <Terms /> },
					{
						path: 'member',
						element: (
							<ProtectedRoute>
								<MemberDashboard />
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
