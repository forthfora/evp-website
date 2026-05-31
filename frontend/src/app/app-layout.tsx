import { Outlet, ScrollRestoration } from 'react-router-dom';

import { Footer } from '@/shared/ui/footer/Footer';
import { Header } from '@/shared/ui/header/Header';
import { GlobalBackground } from '@/shared/ui/common/global-background/GlobalBackground';

export function AppLayout() {
	return (
		<div className="bg-background text-foreground relative flex min-h-screen flex-col justify-between font-sans transition-colors duration-200">
			<div className="fixed inset-0 z-0">
				<GlobalBackground />
			</div>

			<div className="relative z-10 flex min-h-screen flex-col justify-between">
				<Header />
				<main className="mb-auto flex">
					<Outlet />
				</main>
				<Footer />
			</div>

			<ScrollRestoration />
		</div>
	);
}
