import { RouterProvider } from 'react-router';
import { browserRouter } from './browser-router';
import './app.css';
import { ThemeProvider } from '../shared/lib/theme/ThemeContext';

export default function App() {
	return (
		<ThemeProvider>
			<RouterProvider router={browserRouter} />
		</ThemeProvider>
	);
}
