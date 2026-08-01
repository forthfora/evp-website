import { useAuth } from '@/shared/lib/auth/use-auth';
import { SectionDivider } from '@/shared/ui/common';

export function WelcomeWidget() {
	const { user } = useAuth();

	return (
		<div className="glass-box rounded-2xl p-8">
			<h2 className="text-4xl font-bold">
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
