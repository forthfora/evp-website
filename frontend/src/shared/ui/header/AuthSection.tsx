import '@/shared/styles/button-underline.css';
import '@/shared/styles/button-spin.css';

import { ConfirmDialog, InteractiveLinkButton } from '@common';
import { LogOut } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router';

import { RoleColors } from '@/shared/lib/auth/schemas';
import { useAuth } from '@/shared/lib/auth/use-auth';
import { cn } from '@/shared/lib/utils';

interface AuthSectionProps {
	/** Size of the Join EVP button. */
	size?: 'default' | 'large';
}

/**
 * Shared auth section: shows the user's name + role + logout button when
 * authenticated, or the "Join EVP" button when not. Used by both
 * `HeaderActions` and `HeroActions`.
 */
export function AuthSection({ size = 'default' }: AuthSectionProps) {
	const { isAuthenticated, user, logout } = useAuth();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const logoutButtonRef = useRef<HTMLButtonElement>(null);

	return (
		<>
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
								{user.first_name && user.last_name
									? `${user.first_name} ${user.last_name[0]}.`
									: user.first_name
										? user.first_name
										: user.email}
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
					className={cn(
						'tracking-widest uppercase',
						size === 'large' ? 'px-8 py-3 text-base' : 'px-6 py-2 text-sm',
					)}
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
		</>
	);
}
