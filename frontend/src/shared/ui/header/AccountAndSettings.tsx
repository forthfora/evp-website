import '@/shared/styles/button-underline.css';
import '@/shared/styles/button-spin.css';

import { ConfirmDialog, InteractiveLinkButton } from '@common';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router';

import { RoleColors } from '@/shared/lib/auth/schemas';
import { useAuth } from '@/shared/lib/auth/use-auth';
import { cn } from '@/shared/lib/utils';
import { useTheme } from '@/shared/ui/theme/ThemeContext.data';

export function AccountAndSettings() {
	const { theme, toggleTheme } = useTheme();
	const { isAuthenticated, user, logout } = useAuth();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const logoutButtonRef = useRef<HTMLButtonElement>(null);

	return (
		<>
			<div className="flex items-center gap-2">
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
									<Moon className="h-7 w-7 md:h-5 md:w-5" />
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
									<Sun className="h-7 w-7 md:h-5 md:w-5" />
								</motion.span>
							)}
						</AnimatePresence>
					</span>
				</button>
				<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
					|
				</span>
				{isAuthenticated && user ? (
					<>
						<Link
							to="member"
							className="button-underline hidden items-center gap-2 md:flex"
							viewTransition
						>
							<p
								className="text-foreground button-underline max-w-32 truncate text-sm"
								title={user.email}
							>
								<b>
									{user.first_name} {user.last_name[0]}.
								</b>
							</p>
							<span
								className={cn(
									'rounded-full px-2 py-0.5 text-xs font-medium',
									RoleColors[user.role] ?? 'bg-gray-500/20 text-gray-400',
								)}
							>
								{user.role}
							</span>
						</Link>
						<button
							ref={logoutButtonRef}
							onClick={() => setShowLogoutConfirm(true)}
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

				<ConfirmDialog
					open={showLogoutConfirm}
					anchorRef={logoutButtonRef}
					anchorPlacement="top"
					anchorAlign="center"
					title="log out?"
					message="Are you sure you want to log out?"
					destructive
					onConfirm={() => {
						setShowLogoutConfirm(false);
						void logout();
					}}
					onCancel={() => setShowLogoutConfirm(false)}
				/>
			</div>
		</>
	);
}
