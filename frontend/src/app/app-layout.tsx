import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '../shared/ui/header/Header';
import { Footer } from '../shared/ui/footer/Footer';

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
