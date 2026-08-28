import './app.css';

import { RouterProvider } from 'react-router';

import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { browserRouter } from './routes';

export default function App() {
	return (
		<ThemeProvider>
			<QueryProvider>
				<AuthProvider>
					<RouterProvider router={browserRouter} />
				</AuthProvider>
			</QueryProvider>
		</ThemeProvider>
	);
}
