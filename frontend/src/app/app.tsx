import './app.css';

import { RouterProvider } from 'react-router';

import { ThemeProvider } from '@/shared/ui/theme/ThemeContext';

import { browserRouter } from './browser-router';

export default function App() {
	return (
		<ThemeProvider>
			<RouterProvider router={browserRouter} />
		</ThemeProvider>
	);
}
