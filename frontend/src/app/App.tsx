import { RouterProvider } from 'react-router';

import { AppProvider } from './provider';
import { browserRouter } from './router';

export default function App() {
	return (
		<AppProvider>
			<RouterProvider router={browserRouter} />
		</AppProvider>
	);
}
