import { Outlet } from 'react-router-dom';
import { Header } from '../shared/ui/header/Header';
import { Footer } from '../shared/ui/footer/Footer';

export function AppLayout() {
	return (
		<div className="bg-background text-foreground font-sans transition-colors duration-200">
			<Header />
			<main className="mx-auto flex max-w-6xl">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
