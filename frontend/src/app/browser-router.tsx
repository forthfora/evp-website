import { createBrowserRouter } from 'react-router';
import { AppLayout } from './app-layout';
import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/about/AboutPage';
import { EventsPage } from '../pages/events/EventsPage';
import ErrorPage from '../pages/error/ErrorPage';
import { StartupsPage } from '../pages/startups/StartupsPage';
import { ContactPage } from '../pages/contact/ContactPage';
import { PartnersPage } from '../pages/partners/PartnersPage';

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
