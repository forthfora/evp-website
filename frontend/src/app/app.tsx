import { RouterProvider } from 'react-router';
import { browserRouter } from './browser-router';
import { ThemeProvider } from '../shared/ui/ThemeContext';

import './app.css';

export default function App() {
	return (
		<ThemeProvider>
			<RouterProvider router={browserRouter} />
		</ThemeProvider>
	);
}
