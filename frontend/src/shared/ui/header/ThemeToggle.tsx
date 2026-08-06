import '@/shared/styles/button-underline.css';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/shared/ui/theme/ThemeContext.data';

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className="button-underline flex cursor-pointer items-center justify-center border-none bg-transparent p-2"
			aria-label="Toggle theme"
		>
			<span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden md:h-5 md:w-5">
				<AnimatePresence mode="popLayout" initial={false}>
					{theme === 'dark' ? (
						<motion.span
							key="moon"
							initial={{ y: '120%', opacity: 0 }}
							animate={{ y: '0%', opacity: 1 }}
							exit={{ y: '120%', opacity: 0 }}
							transition={{ duration: 1.0, ease: [0.34, 1.2, 0.4, 1] }}
							className="absolute"
						>
							<Moon className="h-6 w-6 md:h-5 md:w-5" />
						</motion.span>
					) : (
						<motion.span
							key="sun"
							initial={{ y: '120%', opacity: 0 }}
							animate={{ y: '0%', opacity: 1 }}
							exit={{ y: '120%', opacity: 0 }}
							transition={{ duration: 1.0, ease: [0.34, 1.2, 0.4, 1] }}
							className="absolute"
						>
							<Sun className="h-6 w-6 md:h-5 md:w-5" />
						</motion.span>
					)}
				</AnimatePresence>
			</span>
		</button>
	);
}
