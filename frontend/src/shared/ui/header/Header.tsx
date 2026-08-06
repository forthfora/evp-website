import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { cn } from '@/shared/lib/utils';

import { HeaderActions } from './HeaderActions';
import { LogoAndTitle } from './LogoAndTitle';
import { HeaderNavButtons } from './nav-link-buttons/NavLinkButtons';

interface HeaderProps {
	fadeInAt?: number;
	fadeOutAt?: number;
	transitionDuration?: number;
	slideDistance?: number;
}

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function Header({
	fadeInAt = 150,
	fadeOutAt = 100,
	transitionDuration = 600,
	slideDistance = 100,
}: HeaderProps) {
	const location = useLocation();
	const isHomePage = location.pathname === '/';

	const [trackedPathname, setTrackedPathname] = useState(location.pathname);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	if (location.pathname !== trackedPathname) {
		setTrackedPathname(location.pathname);
		setMobileMenuOpen(false);
	}

	const [isScrolledPast, setIsScrolledPast] = useState(() => {
		if (typeof window !== 'undefined') {
			return window.scrollY > fadeInAt;
		}
		return false;
	});

	useEffect(() => {
		if (!isHomePage) return;

		const handleScroll = () => {
			const y = window.scrollY;
			setIsScrolledPast((prev) => {
				if (!prev && y > fadeInAt) return true;
				if (prev && y < fadeOutAt) return false;
				return prev;
			});
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [isHomePage, fadeInAt, fadeOutAt]);

	const visible = !isHomePage || isScrolledPast;
	const transition = `opacity ${transitionDuration}ms ${EASING}, transform ${transitionDuration}ms ${EASING}`;

	return (
		<header
			className={cn('fixed z-50 w-full', 'bg-background/70 shadow-md backdrop-blur-xs')}
			style={{
				transition,
				opacity: visible ? 1 : 0,
				transform: `translateY(${visible ? 0 : -slideDistance}px)`,
				pointerEvents: visible ? 'auto' : 'none',
				viewTransitionName: 'site-header',
			}}
			aria-hidden={!visible}
		>
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
				<div className="flex flex-1 justify-start">
					<LogoAndTitle isLarge={false} />
				</div>

				<nav className="hidden shrink-0 flex-wrap items-center justify-center gap-4 md:flex md:gap-6">
					<HeaderNavButtons />
				</nav>

				<div className="flex flex-1 items-center justify-end">
					<div className="hidden md:block">
						<HeaderActions />
					</div>

					<button
						className="text-foreground p-2 md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle mobile menu"
					>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="bg-background absolute top-full left-0 w-full overflow-hidden border-t shadow-lg md:hidden"
					>
						<div className="flex flex-col gap-6 p-6">
							<nav className="flex flex-col gap-4">
								<HeaderNavButtons />
							</nav>
							<hr className="border-border" />
							<div className="flex flex-col gap-4">
								<HeaderActions />
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
