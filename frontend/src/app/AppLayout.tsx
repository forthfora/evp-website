import { Outlet, ScrollRestoration } from 'react-router';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/header/Header';
import { ScrollSpy } from '@/components/layout/scroll/ScrollSpy';
import { GlobalBackground } from '@/components/three/global-background/GlobalBackground';
import { ScrollVisibilityProvider } from '@/components/layout/scroll/ScrollVisibilityProvider';

export function AppLayout() {
	return (
		<ScrollVisibilityProvider>
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
				<ScrollSpy />
			</div>
		</ScrollVisibilityProvider>
	);
}
