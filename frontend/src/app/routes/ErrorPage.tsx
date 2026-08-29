import '@/styles/button-underline.css';

import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export function ErrorPage() {
	const error = useRouteError();

	let title = "We're sorry, something's gone wrong...";
	let errorMessage: string;
	let devDetails: string | undefined;

	if (isRouteErrorResponse(error)) {
		switch (error.status) {
			case 404:
				title = '404 - Page Not Found';
				errorMessage = "We're sorry, the page you are looking for doesn't exist or has been moved.";
				break;

			case 401:
				title = '401 - Unauthorized';
				errorMessage = "We're sorry, you need to be logged in to access this page.";
				break;

			case 403:
				title = '403 - Forbidden';
				errorMessage = "We're sorry, you don't have permission to view this resource.";
				break;

			case 503:
				title = '503 - Service Unavailable';
				errorMessage = "We're sorry, looks like our API is down. Please try again later.";
				break;

			default:
				title = error.statusText
					? `${error.status} - ${error.statusText}`
					: `${error.status} Error`;
				errorMessage =
					error.data?.message ||
					(typeof error.data === 'string'
						? error.data
						: "We're sorry, an unexpected route error occurred.");
		}

		devDetails = typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2);
	} else if (error instanceof Error) {
		errorMessage = error.message;
		devDetails = error.stack;
	} else if (typeof error === 'string') {
		errorMessage = error;
	} else {
		console.error(error);
		errorMessage = 'Unknown error';
		devDetails = JSON.stringify(error, null, 2);
	}

	const isDev = import.meta.env.DEV;

	return (
		<div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-4 py-60 text-center">
			<h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
			<div className="text-foreground-muted my-2 w-full max-w-md border-b" />
			<p className="text-lg">{errorMessage}</p>
			<Link
				to="/"
				className="text-accent button-underline px-12 py-2 text-xl font-bold"
				viewTransition
			>
				Return to Home
			</Link>

			{isDev && devDetails && (
				<details className="mt-8 w-full overflow-hidden rounded-l bg-gray-800 p-4 text-left">
					<summary className="cursor-pointer font-semibold text-gray-200">
						Developer Error Details
					</summary>
					<pre className="mt-4 overflow-auto p-2 text-sm whitespace-pre-wrap text-red-600 dark:text-red-400">
						{devDetails}
					</pre>
				</details>
			)}
		</div>
	);
}
