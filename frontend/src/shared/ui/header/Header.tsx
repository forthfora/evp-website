import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LogoAndTitle } from './LogoAndTitle';
import { HeaderNavButtons } from './NavLinkButtons';
import { AccountAndSettings } from './AccountAndSettings';

interface HeaderProps {
	/**
	 * How far the user must scroll DOWN (px) before the header appears.
	 * On non-home pages the header is always visible.
	 * @default 150
	 */
	fadeInAt?: number;
	/**
	 * How far the user must scroll back UP (px) before the header hides again.
	 * @default 100
	 */
	fadeOutAt?: number;
	/** Transition duration in milliseconds. @default 600 */
	transitionDuration?: number;
	/**
	 * How far (px) the header slides from when entering / slides to when leaving.
	 * Positive = starts above and drops down into place.
	 * @default 16
	 */
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
			}}
			aria-hidden={!visible}
		>
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
				<LogoAndTitle size="small" />
				<nav className="flex flex-wrap items-center gap-4 md:gap-6">
					<HeaderNavButtons />
				</nav>
				<AccountAndSettings />
			</div>
		</header>
	);
}
