import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { WidgetCard } from '@/components/ui';
import { useMembers } from '@/features/auth/api/api';
import { type MemberOut,RoleColors } from '@/features/auth/api/schemas';
import { cn } from '@/utils/cn';

type SortField = keyof Pick<
	MemberOut,
	'email' | 'first_name' | 'last_name' | 'role' | 'date_joined' | 'receives_update_emails'
>;

type SortDir = 'asc' | 'desc';

interface Column {
	field: SortField;
	label: string;
}

const COLUMNS: Column[] = [
	{ field: 'email', label: 'email' },
	{ field: 'first_name', label: 'first name' },
	{ field: 'last_name', label: 'last name' },
	{ field: 'role', label: 'role' },
	{ field: 'date_joined', label: 'joined' },
	{ field: 'receives_update_emails', label: 'email updates' },
];

function compareMembers(a: MemberOut, b: MemberOut, field: SortField): number {
	const av = a[field];
	const bv = b[field];
	if (typeof av === 'boolean' && typeof bv === 'boolean') return Number(av) - Number(bv);
	// ISO 8601 date strings sort correctly lexicographically.
	return String(av).localeCompare(String(bv));
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString();
}

export function MembersWidget() {
	const { data: members = [], isLoading, error } = useMembers();
	const [sortField, setSortField] = useState<SortField>('email');
	const [sortDir, setSortDir] = useState<SortDir>('asc');

	const sortedMembers = useMemo(() => {
		return [...members].sort((a, b) => {
			const result = compareMembers(a, b, sortField);
			return sortDir === 'asc' ? result : -result;
		});
	}, [members, sortField, sortDir]);

	function toggleSort(field: SortField) {
		if (field === sortField) {
			setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(field);
			setSortDir('asc');
		}
	}

	return (
		<WidgetCard
			title="Member List"
			description="All members of EVP registered to the site. Only visible to committee members."
		>
			<div className="mt-5">
				{isLoading && <p className="text-foreground/60 text-sm">Loading members...</p>}

				{error && (
					<p className="text-foreground/60 text-sm" role="alert">
						Failed to load members.
					</p>
				)}

				{!isLoading && !error && (
					<div className="overflow-x-auto">
						<table className="w-full min-w-150 text-left text-sm">
							<thead>
								<tr className="text-foreground/50 border-accent/20 border-b text-xs tracking-widest uppercase">
									{COLUMNS.map((column) => {
										const active = column.field === sortField;
										const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
										return (
											<th key={column.field} className="pb-2 font-semibold">
												<button
													type="button"
													onClick={() => toggleSort(column.field)}
													className="hover:text-foreground inline-flex cursor-pointer items-center gap-1"
													aria-sort={
														active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
													}
												>
													{column.label}
													<Icon size={12} className={cn(active ? 'opacity-100' : 'opacity-40')} />
												</button>
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody>
								{sortedMembers.length === 0 && (
									<tr>
										<td colSpan={COLUMNS.length} className="text-foreground/60 py-4">
											No members found.
										</td>
									</tr>
								)}
								{sortedMembers.map((member) => (
									<tr key={member.username} className="border-accent/10 border-b">
										<td className="py-2 pr-2">
											<span className="block max-w-45 truncate" title={member.email}>
												{member.email}
											</span>
										</td>
										<td className="text-foreground/60 py-2">{member.first_name}</td>
										<td className="text-foreground/60 py-2">{member.last_name}</td>
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
					</div>
				)}
			</div>
		</WidgetCard>
	);
}
