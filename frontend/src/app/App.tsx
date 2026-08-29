import { RouterProvider } from 'react-router';
import { browserRouter } from './router';
import { AppProvider } from './provider';

export default function App() {
	return (
		<AppProvider>
			<RouterProvider router={browserRouter} />
		</AppProvider>
	);
}
