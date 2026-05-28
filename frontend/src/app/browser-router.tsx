import { createBrowserRouter } from 'react-router';
import { AppLayout } from './app-layout';
import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/about/AboutPage';
import { EventsPage } from '../pages/events/EventsPage';
import ErrorPage from '../pages/error/ErrorPage';

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
				path: 'events',
				element: <EventsPage />,
			},
		],
	},
]);
