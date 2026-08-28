import { useEffect, useState } from 'react';

import { type Theme, ThemeContext } from './ThemeContext.data';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// Initialize from localStorage, fallback to system preferences
	const [theme, setTheme] = useState<Theme>(() => {
		const saved = localStorage.getItem('app-theme') as Theme;
		if (saved === 'light' || saved === 'dark') return saved;
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	});

	// Whenever the theme state changes, update the document DOM attribute
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('app-theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
