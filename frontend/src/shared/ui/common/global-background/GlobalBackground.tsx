import { lazy, Suspense } from 'react';
import { useTheme } from '../../ThemeContext';

const ColorBends = lazy(() => import('./ColorBends'));

export function GlobalBackground() {
	const { theme } = useTheme();
	const colors = theme === 'dark' ? ['292852', '0d0c2b'] : ['6262a1', '7676a3'];

	const fallbackBgClass = theme === 'dark' ? 'bg-[#0d0c2b]' : 'bg-[#7676a3]';

	return (
		<div
			className={`h-full w-full opacity-40 blur-md transition-colors duration-300 ${fallbackBgClass}`}
		>
			<Suspense fallback={<div className="h-full w-full" />}>
				<ColorBends
					colors={colors}
					rotation={20}
					speed={0.15}
					scale={0.7}
					frequency={1.5}
					warpStrength={0.95}
					mouseInfluence={0}
					noise={0}
					parallax={0}
					iterations={3}
					intensity={1.5}
					bandWidth={6}
					transparent={true}
					autoRotate={1}
				/>
			</Suspense>
		</div>
	);
}
