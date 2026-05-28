import { Link, useLocation } from 'react-router-dom';
import evpLogo from '../../assets/evp-logo.png';
import '../../styles/button-underline.css';
import { cn } from '../../lib/utils';

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
			className={cn('group drop-shadow-10xl flex items-center', isLarge ? 'gap-10' : 'gap-5')}
			onClick={isHome ? () => window.scrollTo({ top: 0, behavior: 'instant' }) : undefined}
		>
			<img
				src={evpLogo}
				alt="Edinburgh VenturePoint Logo"
				className="object-contain"
				style={{
					width: isLarge ? '14rem' : '5rem',
					height: isLarge ? '14rem' : '5rem',
				}}
			/>
			<div
				key={`${size}-${location.pathname}-${isVisible}`}
				className={cn(
					'font-title bg-[linear-gradient(135deg,var(--color-highlight)_35%,var(--color-highlight-inverted)_50%,var(--color-highlight)_65%)] bg-size-[300%_300%] bg-clip-text leading-tight whitespace-nowrap text-transparent',
					isLarge
						? 'animate-shimmer [animation-delay:0.5s]'
						: 'group-hover:animate-shimmer button-underline [animation-delay:0s]',
				)}
				style={{ fontSize: isLarge ? '4rem' : '1.25rem' }}
			>
				Edinburgh
				<br />
				VenturePoint
			</div>
		</Wrapper>
	);
}
