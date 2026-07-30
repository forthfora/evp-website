import './app.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { AuthProvider } from '@/shared/lib/auth/auth-context.tsx';
import { ThemeProvider } from '@/shared/ui/theme/ThemeContext';

import { browserRouter } from './browser-router';

const queryClient = new QueryClient();

export default function App() {
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<RouterProvider router={browserRouter} />
				</AuthProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
