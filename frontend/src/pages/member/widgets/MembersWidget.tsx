import { useQuery } from '@tanstack/react-query';

import { fetchMembers } from '@/shared/lib/auth/api';
import { Role } from '@/shared/lib/auth/schemas';
import { cn } from '@/shared/lib/utils';

const roleBadge: Record<string, string> = {
	[Role.MEMBER]: 'bg-gray-500/20 text-gray-400',
	[Role.SCOUT]: 'bg-blue-500/20 text-blue-400',
	[Role.COMMITTEE]: 'bg-purple-500/20 text-purple-400',
	[Role.ADMIN]: 'bg-amber-500/20 text-amber-400',
};

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString();
}

export function MembersWidget() {
	const {
		data: members = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['members'],
		queryFn: fetchMembers,
	});

	return (
		<div className="glass-box rounded-2xl p-8">
			<h2 className="text-2xl font-bold">Members</h2>
			<p className="text-foreground/60 mt-1 text-sm">View all society members.</p>

			<div className="mt-5">
				{isLoading && <p className="text-foreground/60 text-sm">Loading members…</p>}

				{error && (
					<p className="text-foreground/60 text-sm" role="alert">
						Failed to load members.
					</p>
				)}

				{!isLoading && !error && (
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="text-foreground/50 border-accent/20 border-b text-xs tracking-widest uppercase">
								<th className="pb-2 font-semibold">email</th>
								<th className="pb-2 font-semibold">role</th>
								<th className="pb-2 font-semibold">joined</th>
								<th className="pb-2 font-semibold">updates</th>
							</tr>
						</thead>
						<tbody>
							{members.length === 0 && (
								<tr>
									<td colSpan={4} className="text-foreground/60 py-4">
										No members yet.
									</td>
								</tr>
							)}
							{members.map((member) => (
								<tr key={member.id} className="border-accent/10 border-b">
									<td className="py-2 pr-2">
										<span className="block max-w-45 truncate" title={member.email}>
											{member.email}
										</span>
									</td>
									<td className="py-2 pr-2">
										<span
											className={cn(
												'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
												roleBadge[member.role] ?? 'bg-gray-500/20 text-gray-400',
											)}
										>
											{member.role}
										</span>
									</td>
									<td className="text-foreground/60 py-2 pr-2 whitespace-nowrap">
										{formatDate(member.date_joined)}
									</td>
									<td className="text-foreground/60 py-2">
										{member.receives_update_emails ? 'opted in' : 'opted out'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
