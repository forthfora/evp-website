import { useAuth } from '@/shared/lib/auth/use-auth';
import { SectionDivider } from '@/shared/ui/common';

export function WelcomeWidget() {
	const { user } = useAuth();

	return (
		<div className="glass-box rounded-2xl p-8">
			<h2 className="font-title animate-shimmer mx-auto bg-[linear-gradient(90deg,var(--color-highlight)_35%,var(--color-highlight-inverted)_50%,var(--color-highlight)_65%)] bg-size-[300%_300%] bg-clip-text text-4xl leading-tight text-transparent [animation-delay:1.0s] md:whitespace-nowrap">
				Welcome, {user?.first_name} {user?.last_name}.
			</h2>
			<SectionDivider />
			<p className="text-foreground-muted mt-2">
				This is the member dashboard. From here, you can manage all things about your VenturePoint
				account.
			</p>
		</div>
	);
}
