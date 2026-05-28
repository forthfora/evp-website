import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // 1. Import Framer Motion
import { cn } from '../../lib/utils';
import { LogoAndTitle } from './LogoAndTitle';
import { HeaderNavButtons } from './NavLinkButtons';
import { AccountAndSettings } from './AccountAndSettings';

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

	const [visible, setVisible] = useState(!isHomePage);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (!isHomePage) {
			setVisible(true);
			return;
		}

		setVisible(window.scrollY > fadeInAt);

		const handleScroll = () => {
			const y = window.scrollY;
			setVisible((prev) => {
				if (!prev && y > fadeInAt) return true;
				if (prev && y < fadeOutAt) return false;
				return prev;
			});
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [isHomePage, fadeInAt, fadeOutAt]);

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
				<LogoAndTitle size="small" />

				<nav className="hidden flex-wrap items-center gap-4 md:flex md:gap-6">
					<HeaderNavButtons />
				</nav>

				<div className="hidden md:block">
					<AccountAndSettings />
				</div>

				<button
					className="text-foreground p-2 md:hidden"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle mobile menu"
				>
					{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
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
								<AccountAndSettings />
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
