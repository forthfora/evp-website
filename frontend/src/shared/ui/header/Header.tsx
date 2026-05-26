import { Moon, Sun } from 'lucide-react';
import { NavLinkItem } from './NavLinkItem';
import { useTheme } from '../ThemeContext';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

import evpLogo from '../../assets/evp-logo.png';

import './ThemeToggle.css';

const NAV_LINKS = [
	{ path: '/about', label: 'about' },
	{ path: '/startups', label: 'services' },
	{ path: '/investing', label: 'contact' },
	{ path: '/partners', label: 'partners' },
	{ path: '/events', label: 'events' },
];

const SCROLL_DOWN_SHRINK_THRESHOLD = 200;
const SCROLL_UP_EXPAND_THRESHOLD = 150;
const FADE_DURATION_MS = 800;

const EASING = `cubic-bezier(0.22, 1, 0.36, 1)`;
const FADE_TRANSITION = `opacity ${FADE_DURATION_MS}ms ${EASING}`;

export function Header() {
	const { theme, toggleTheme } = useTheme();
	const location = useLocation();
	const isHomePage = location.pathname === '/';
	const [isMini, setIsMini] = useState(!isHomePage);

	useEffect(() => {
		if (!isHomePage) {
			setIsMini(true);
			return;
		}

		setIsMini(window.scrollY > SCROLL_DOWN_SHRINK_THRESHOLD);

		const handleScroll = () => {
			const currentScroll = window.scrollY;
			setIsMini((prev) => {
				if (!prev && currentScroll > SCROLL_DOWN_SHRINK_THRESHOLD) return true;
				if (prev && currentScroll < SCROLL_UP_EXPAND_THRESHOLD) return false;
				return prev;
			});
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [isHomePage]);

	const fadeStyle = (visible: boolean) => ({
		transition: FADE_TRANSITION,
		opacity: visible ? 1 : 0,
		pointerEvents: (visible ? 'auto' : 'none') as React.CSSProperties['pointerEvents'],
	});

	return (
		<header
			className={cn(
				'fixed z-50 w-full transition-all duration-400',
				isMini
					? 'bg-background/70 shadow-md backdrop-blur-xs'
					: 'y-10 bg-transparen py-50 text-shadow-2xs',
			)}
		>
			<div
				className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8"
				style={fadeStyle(!isMini)}
				aria-hidden={isMini}
			>
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="bg-background/30 h-50 w-400 rounded-full blur-3xl" />
				</div>

				<div className="relative flex w-full max-w-7xl flex-col items-center gap-6">
					<LogoAndTitle size="large" />
					<nav className="flex flex-wrap items-center gap-4 md:gap-6">
						<NavLinks toggleTheme={toggleTheme} theme={theme} />
					</nav>
				</div>
			</div>

			<div
				className="absolute inset-0 flex items-center px-6 py-3"
				style={fadeStyle(isMini)}
				aria-hidden={!isMini}
			>
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between">
					<LogoAndTitle size="small" />
					<nav className="flex flex-wrap items-center gap-4 md:gap-6">
						<NavLinks toggleTheme={toggleTheme} theme={theme} />
					</nav>
				</div>
			</div>

			<div
				className="pointer-events-none invisible flex flex-col items-center px-6 py-8"
				aria-hidden
				style={{
					transition: `all ${FADE_DURATION_MS}ms ${EASING}`,
					...(isMini ? { padding: '0.75rem 1.5rem' } : {}),
				}}
			>
				<div className="flex flex-col items-center gap-6">
					<nav className="pointer-events-none flex items-center gap-4 opacity-0">
						<NavLinks toggleTheme={toggleTheme} theme={theme} />
					</nav>
				</div>
			</div>
		</header>
	);
}

function LogoAndTitle({ size }: { size: 'large' | 'small' }) {
	const isLarge = size === 'large';
	const location = useLocation();
	const isHome = location.pathname === '/';

	const Wrapper = isLarge ? 'span' : Link;

	return (
		<Wrapper
			{...(!isLarge && ({ to: '/' } as any))}
			className="flex items-center gap-5"
			onClick={isHome ? () => window.scrollTo({ top: 0, behavior: 'instant' }) : undefined}
		>
			<img
				src={evpLogo}
				alt="Edinburgh VenturePoint Logo"
				className="object-contain"
				style={{
					width: isLarge ? '12rem' : '5rem',
					height: isLarge ? '12rem' : '5rem',
				}}
			/>
			<div
				className="font-title leading-tight whitespace-nowrap"
				style={{ fontSize: isLarge ? '3rem' : '1.25rem' }}
			>
				Edinburgh
				<br />
				VenturePoint
			</div>
		</Wrapper>
	);
}

function NavLinks({ toggleTheme, theme }: { toggleTheme: () => void; theme: string }) {
	return (
		<>
			{NAV_LINKS.map((link, i) => (
				<span key={link.path} className="flex items-center gap-4 md:gap-6">
					<NavLinkItem to={link.path} label={link.label} />
					{i < NAV_LINKS.length - 1 && (
						<span className="text-muted-foreground select-none" aria-hidden>
							|
						</span>
					)}
				</span>
			))}
			<button
				onClick={toggleTheme}
				className="flex cursor-pointer items-center justify-center border-none bg-transparent p-2"
				aria-label="Toggle theme"
			>
				{theme === 'dark' ? (
					<Moon key="moon" size={18} className="theme-icon" />
				) : (
					<Sun key="sun" size={18} className="theme-icon" />
				)}
			</button>
		</>
	);
}
