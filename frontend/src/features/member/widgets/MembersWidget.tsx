import { useMembers } from '@/lib/auth/api';
import { RoleColors } from '@/lib/auth/schemas';
import { cn } from '@/lib/utils/cn';

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString();
}

export function MembersWidget() {
	const { data: members = [], isLoading, error } = useMembers();

	return (
		<div className="glass-box rounded-2xl p-8">
			<h2 className="text-2xl font-bold">Member List</h2>
			<p className="text-foreground/60 mt-1 text-sm">
				All members of EVP registered to the site. Only visible to committee members.
			</p>

			<div className="mt-5">
				{isLoading && <p className="text-foreground/60 text-sm">Loading members...</p>}

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
								<th className="pb-2 font-semibold">first name</th>
								<th className="pb-2 font-semibold">last name</th>
								<th className="pb-2 font-semibold">role</th>
								<th className="pb-2 font-semibold">joined</th>
								<th className="pb-2 font-semibold">email updates</th>
							</tr>
						</thead>
						<tbody>
							{members.length === 0 && (
								<tr>
									<td colSpan={4} className="text-foreground/60 py-4">
										No members found.
									</td>
								</tr>
							)}
							{members.map((member) => (
								<tr key={member.username} className="border-accent/10 border-b">
									<td className="py-2 pr-2">
										<span className="block max-w-45 truncate" title={member.email}>
											{member.email}
										</span>
									</td>
									<td className="text-foreground/60 py-2">{member.first_name}</td>
									<td className="text-foreground/60 mx-auto py-2">{member.last_name}</td>
									<td className="py-2 pr-2">
										<span
											className={cn(
												'rounded-full px-2 py-0.5 text-xs font-medium',
												RoleColors[member.role] ?? 'bg-gray-500/20 text-gray-400',
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
