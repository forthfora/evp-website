import { createBrowserRouter } from 'react-router';
import { AppLayout } from './app-layout';
import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/about/AboutPage';

export const browserRouter = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'about',
				element: <AboutPage />,
			},
		],
	},
]);
