import { Outlet, ScrollRestoration } from 'react-router-dom';

import { Footer } from '@/shared/ui/footer/Footer';
import { Header } from '@/shared/ui/header/Header';

export function AppLayout() {
	return (
		<div className="bg-background text-foreground flex min-h-screen flex-col justify-between font-sans transition-colors duration-200">
			<Header />
			<main className="mb-auto flex">
				<Outlet />
			</main>
			<Footer />
			<ScrollRestoration />
		</div>
	);
}
