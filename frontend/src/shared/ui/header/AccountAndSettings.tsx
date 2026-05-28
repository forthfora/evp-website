import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import '../../styles/button-underline.css';
import '../../styles/button-spin.css';

export function AccountAndSettings() {
	const { theme, toggleTheme } = useTheme();

	return (
		<div className="flex items-center gap-2">
			{/* Theme toggle */}
			<button
				onClick={toggleTheme}
				className="button-underline flex cursor-pointer items-center justify-center border-none bg-transparent p-2"
				aria-label="Toggle theme"
			>
				{theme === 'dark' ? (
					<Moon key="moon" size={18} className="button-spin" />
				) : (
					<Sun key="sun" size={18} className="button-spin" />
				)}
			</button>
			<span className="text-foreground-muted select-none" aria-hidden>
				|
			</span>
			<button
				onClick={() => {
					/* TODO: navigate to login */
				}}
				className="button-underline text-md cursor-pointer px-3 py-1.5 font-medium"
			>
				Already a member? <b>Sign in</b>
			</button>
		</div>
	);
}
