import { SectionDivider } from '@/components/ui';
import { useAuth } from '@/lib/auth/use-auth';

export function WelcomeWidget() {
	const { user } = useAuth();

	const displayName =
		user?.first_name && user?.last_name
			? `${user.first_name} ${user.last_name}`
			: user?.first_name
				? user.first_name
				: 'there';

	return (
		<div className="glass-box rounded-2xl p-8">
			<h2 className="font-title animate-shimmer mx-auto bg-[linear-gradient(90deg,var(--color-highlight)_35%,var(--color-highlight-inverted)_50%,var(--color-highlight)_65%)] bg-size-[300%_300%] bg-clip-text text-4xl leading-tight text-transparent [animation-delay:1.0s] md:whitespace-nowrap">
				Welcome, {displayName}.
			</h2>
			<SectionDivider />
			<p className="text-foreground-muted mt-2">
				This is the member dashboard. From here, you can manage all things about your VenturePoint
				account.
			</p>
		</div>
	);
}
