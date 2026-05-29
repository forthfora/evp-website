import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

import evpLogo from '../../assets/evp-logo.webp';

import '../../styles/button-underline.css';
import '../../styles/logo-build.css';

interface LogoAndTitleProps {
	size: 'large' | 'small';
	isVisible?: boolean;
}

export function LogoAndTitle({ size, isVisible = true }: LogoAndTitleProps) {
	const isLarge = size === 'large';
	const location = useLocation();
	const isHome = location.pathname === '/';

	const Wrapper = isLarge ? 'span' : Link;

	return (
		<Wrapper
			{...(!isLarge && ({ to: '/' } as any))}
			className={cn(
				'group drop-shadow-10xl flex items-center justify-center',
				isLarge ? 'flex-col gap-4 md:flex-row md:gap-10' : 'flex-row gap-5',
			)}
			onClick={isHome ? () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) : undefined}
			viewTransition={!isHome}
		>
			<div className="logo-container">
				<img
					src={evpLogo}
					alt="Edinburgh VenturePoint Logo"
					className={cn(
						'logo-build object-contain',
						isLarge ? 'h-32 w-32 md:h-56 md:w-56' : 'h-20 w-20',
					)}
				/>
			</div>
			<div
				key={`${size}-${location.pathname}-${isVisible}`}
				className={cn(
					'font-title bg-[linear-gradient(135deg,var(--color-highlight)_35%,var(--color-highlight-inverted)_50%,var(--color-highlight)_65%)] bg-size-[300%_300%] bg-clip-text leading-tight text-transparent md:whitespace-nowrap',
					isLarge
						? 'animate-shimmer text-center text-5xl [animation-delay:0.5s] md:text-left md:text-[4rem]'
						: 'button-underline group-hover:animate-shimmer text-[1.25rem] [animation-delay:0s]',
				)}
			>
				Edinburgh
				<br />
				VenturePoint
			</div>
		</Wrapper>
	);
}
