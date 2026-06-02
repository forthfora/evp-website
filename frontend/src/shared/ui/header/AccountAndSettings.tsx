import '@/shared/styles/button-underline.css';
import '@/shared/styles/button-spin.css';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/shared/ui/theme/ThemeContext.data';

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
					<Moon key="moon" className="button-spin h-7 w-7 md:h-5 md:w-5" />
				) : (
					<Sun key="sun" className="button-spin h-7 w-7 md:h-5 md:w-5" />
				)}
			</button>
			{/* {account()} */}
		</div>
	);
}

// TODO
// function account() {
// 	return (
// 		<div>
// 			<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
// 				|
// 			</span>
// 			<button
// 				onClick={() => {
// 					/* TODO: navigate to login */
// 				}}
// 				className="button-underline text-md cursor-pointer px-3 py-1.5 font-medium"
// 			>
// 				Already a member? <b>Sign in</b>
// 			</button>
// 		</div>
// 	);
// }
