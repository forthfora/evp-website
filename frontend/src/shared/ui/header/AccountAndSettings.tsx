import '@/shared/styles/button-underline.css';
import '@/shared/styles/button-spin.css';

import { InteractiveLinkButton } from '@common';
import { LogOut, Moon, Sun } from 'lucide-react';

import { Role } from '@/shared/lib/auth/schemas';
import { useAuth } from '@/shared/lib/auth/use-auth';
import { cn } from '@/shared/lib/utils';
import { useTheme } from '@/shared/ui/theme/ThemeContext.data';

const roleBadge: Record<string, string> = {
	[Role.MEMBER]: 'bg-gray-500/20 text-gray-400',
	[Role.SCOUT]: 'bg-blue-500/20 text-blue-400',
	[Role.COMMITTEE]: 'bg-purple-500/20 text-purple-400',
	[Role.ADMIN]: 'bg-amber-500/20 text-amber-400',
};

export function AccountAndSettings() {
	const { theme, toggleTheme } = useTheme();
	const { isAuthenticated, user, logout } = useAuth();

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

			<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
				|
			</span>

			{isAuthenticated && user ? (
				<>
					<div className="hidden items-center gap-2 md:flex">
						<span className="text-foreground/80 max-w-32 truncate text-sm" title={user.email}>
							{user.email}
						</span>
						<span
							className={cn(
								'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
								roleBadge[user.role] ?? 'bg-gray-500/20 text-gray-400',
							)}
						>
							{user.role}
						</span>
					</div>
					<button
						onClick={logout}
						className="button-underline flex cursor-pointer items-center gap-1 px-2 py-1.5 text-sm"
						aria-label="log out"
					>
						<LogOut size={20} />
						<span className="hidden md:inline">log out</span>
					</button>
				</>
			) : (
				<InteractiveLinkButton
					to="/join"
					className="px-6 py-2 text-sm tracking-widest uppercase"
					ariaLabel="Join EVP"
				>
					Join EVP
				</InteractiveLinkButton>
			)}
		</div>
	);
}
