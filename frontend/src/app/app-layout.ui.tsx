import { Outlet, Link } from 'react-router';
import { useTheme } from '../shared/lib/theme/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import evpLogo from '../shared/assets/evp-logo.png';

export function AppLayout() {
	const { theme, toggleTheme } = useTheme();

	const navLinks = [
		{ path: '/', label: 'home' },
		{ path: '/about', label: 'about' },
		{ path: '/startups', label: 'services' },
		{ path: '/investing', label: 'contact' },
		{ path: '/partners', label: 'partners' },
		{ path: '/events', label: 'events' },
	];

	return (
		<div className="scrollbar-track-background scrollbar-thumb-foreground-muted bg-background text-foreground flex min-h-screen w-full scrollbar-thin font-sans transition-colors duration-200">
			<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
				<header className="bg-background sticky top-0 z-50 flex shrink-0 items-center justify-between py-6">
					{/* Title & Logo Container */}
					<div className="flex items-center gap-3 text-xl font-bold tracking-tight">
						{/* Logo Image */}
						<img
							src={evpLogo}
							alt="Edinburgh VenturePoint Logo"
							className="h-12 w-auto object-contain"
						/>

						{/* Title Text */}
						<span className="font-title">Edinburgh VenturePoint</span>
					</div>

					{/* Links */}
					<nav className="flex items-center gap-8">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className="content-center font-medium no-underline"
							>
								{link.label}
							</Link>
						))}

						{/* Theme Toggle Button */}
						<button
							onClick={toggleTheme}
							className="flex cursor-pointer items-center justify-center border-none bg-transparent p-2 hover:opacity-80"
							aria-label="Toggle theme"
						>
							{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
						</button>
					</nav>
				</header>

				<main className="">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
