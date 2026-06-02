import '@/shared/styles/button-underline.css';
import '@/shared/styles/logo-build.css';

import { Link, useLocation } from 'react-router-dom';

import evpLogo from '@/shared/assets/evp-logo.webp';
import { cn } from '@/shared/lib/utils';

interface LogoAndTitleProps {
	isLarge: boolean;
}

export function LogoAndTitle({ isLarge }: LogoAndTitleProps) {
	const location = useLocation();
	const isHome = location.pathname === '/';

	const wrapperClassName = cn(
		'group drop-shadow-10xl flex items-center justify-center',
		isLarge ? 'flex-col gap-4 md:flex-row md:gap-10' : 'flex-row gap-5',
	);

	if (isLarge) {
		return <span className={wrapperClassName}> {content(isLarge)}</span>;
	}

	return (
		<Link
			to="/"
			className={wrapperClassName}
			viewTransition={!isHome}
			onClick={isHome ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}
		>
			{content(isLarge)}
		</Link>
	);
}

function content(isLarge: boolean) {
	return (
		<>
			<div className="logo-container">
				<img
					src={evpLogo}
					alt="Edinburgh VenturePoint Logo"
					className={cn(
						'logo-build object-contain',
						isLarge
							? 'h-32 w-32 md:h-56 md:w-56'
							: 'min-h-15 min-w-15 md:h-20 md:min-h-auto md:w-20 md:min-w-auto',
					)}
				/>
			</div>
			<h1
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
			</h1>
		</>
	);
}
