import { SectionDivider, ShimmerTitle, WidgetCard } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function WelcomeWidget() {
	const { user } = useAuth();

	const displayName =
		user?.first_name && user?.last_name
			? `${user.first_name} ${user.last_name}`
			: user?.first_name
				? user.first_name
				: 'there';

	return (
		<WidgetCard title="">
			<h2 className="mx-auto text-4xl leading-tight md:whitespace-nowrap">
				<ShimmerTitle className="[animation-delay:1.0s]">Welcome, {displayName}.</ShimmerTitle>
			</h2>
			<SectionDivider />
			<p className="text-foreground-muted mt-2">
				This is the member dashboard. From here, you can manage all things about your VenturePoint
				account.
			</p>
		</WidgetCard>
	);
}
