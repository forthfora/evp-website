import { useTheme } from '../../ThemeContext';
import ColorBends from './ColorBends';

export function GlobalBackground() {
	const { theme } = useTheme();
	const colors = theme === 'dark' ? ['292852', '0d0c2b'] : ['6262a1', '7676a3'];

	return (
		<div className="h-full w-full opacity-40 blur-md">
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
		</div>
	);
}
