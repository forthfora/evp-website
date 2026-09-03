import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { WidgetCard } from '@/components/ui';
import { buttonVariants } from '@/components/ui/interactive/Button';
import { inputVariants } from '@/components/ui/interactive/Input';
import { labelVariants } from '@/components/ui/labels/Label';
import type { Role } from '@/features/auth/api/schemas';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
	createFounder,
	createStartup,
	deleteFounder,
	deleteStartup,
	fetchFounders,
	fetchStartups,
	type FounderIn,
	type FounderOut,
	type StartupIn,
	type StartupOut,
	updateFounder,
	updateStartup,
} from '@/lib/api/startupdb';
import { cn } from '@/utils/cn';

/** Ownership rule mirroring `can_manage_entry` in the backend. */
function canManage(createdBy: string, username: string | undefined, role: Role): boolean {
	if (role === 'admin') return true;
	if (role === 'scout' || role === 'committee') {
		return username !== undefined && createdBy === username;
	}
	return false;
}

export function StartupDatabaseWidget() {
	const { user } = useAuth();
	const [tab, setTab] = useState<'startups' | 'founders'>('startups');

	const role = user?.role ?? 'member';
	const username = user?.username;

	return (
		<WidgetCard
			title="Start-up Database"
			description="Browse and manage your start-up entries."
			className="flex w-full flex-col"
		>
			<div className="mb-4 flex gap-2">
				<button
					type="button"
					onClick={() => setTab('startups')}
					className={cn(
						buttonVariants({ intent: 'ghost', size: 'sm' }),
						tab === 'startups' && 'bg-accent/20',
					)}
				>
					Startups
				</button>
				<button
					type="button"
					onClick={() => setTab('founders')}
					className={cn(
						buttonVariants({ intent: 'ghost', size: 'sm' }),
						tab === 'founders' && 'bg-accent/20',
					)}
				>
					Founders
				</button>
			</div>

			{tab === 'startups' ? (
				<StartupsSection username={username} role={role} />
			) : (
				<FoundersSection username={username} role={role} />
			)}
		</WidgetCard>
	);
}

function StartupsSection({ username, role }: { username: string | undefined; role: Role }) {
	const queryClient = useQueryClient();
	const {
		data: startups = [],
		isLoading,
		error,
	} = useQuery({ queryKey: ['startups'], queryFn: fetchStartups });
	const { data: founders = [] } = useQuery({ queryKey: ['founders'], queryFn: fetchFounders });

	const [editing, setEditing] = useState<StartupOut | 'new' | null>(null);

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['startups'] });
	};

	const createMut = useMutation({
		mutationFn: createStartup,
		onSuccess: () => {
			invalidate();
			setEditing(null);
		},
	});

	const updateMut = useMutation({
		mutationFn: ({ id, patch }: { id: number; patch: StartupIn }) => updateStartup(id, patch),
		onSuccess: () => {
			invalidate();
			setEditing(null);
		},
	});

	const deleteMut = useMutation({
		mutationFn: deleteStartup,
		onSuccess: invalidate,
	});

	if (isLoading) {
		return <p className="text-foreground/60 mt-6 text-sm">Loading startups...</p>;
	}

	if (error) {
		return (
			<p className="text-foreground/60 mt-6 text-sm" role="alert">
				Failed to load startups.
			</p>
		);
	}

	return (
		<div className="mt-6 flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<p className="text-foreground/60 text-sm">
					{startups.length} startup{startups.length === 1 ? '' : 's'}
				</p>
				<button
					type="button"
					className={buttonVariants({ intent: 'primary', size: 'sm' })}
					onClick={() => setEditing('new')}
				>
					Add startup
				</button>
			</div>

			{editing && (
				<StartupForm
					founders={founders}
					initial={editing === 'new' ? null : editing}
					isPending={createMut.isPending || updateMut.isPending}
					onSubmit={(values) => {
						if (editing === 'new') {
							createMut.mutate(values);
						} else {
							updateMut.mutate({ id: editing.id, patch: values });
						}
					}}
					onCancel={() => setEditing(null)}
				/>
			)}

			<div className="flex flex-col gap-3">
				{startups.length === 0 && (
					<p className="text-foreground/60 text-sm">No startups yet — add the first one.</p>
				)}

				{startups.map((startup) => {
					const manage = canManage(startup.created_by, username, role);
					const foundersText =
						startup.founders.length > 0
							? startup.founders.map((f) => `${f.first_name} ${f.last_name}`).join(', ')
							: '—';

					return (
						<div
							key={startup.id}
							className="border-accent/20 flex flex-col gap-1 rounded-lg border p-4"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div className="min-w-0">
									<h3 className="text-base font-bold">{startup.name}</h3>
									<p className="text-foreground/60 truncate text-sm">
										{foundersText}
										{startup.founding_date ? ` · founded ${startup.founding_date}` : ''}
									</p>
								</div>
								{manage && (
									<div className="flex shrink-0 gap-2">
										<button
											type="button"
											className={buttonVariants({ intent: 'ghost', size: 'sm' })}
											onClick={() => setEditing(startup)}
										>
											Edit
										</button>
										<button
											type="button"
											className={cn(
												buttonVariants({ intent: 'ghost', size: 'sm' }),
												'hover:border-red-500/60 hover:text-red-500',
											)}
											disabled={deleteMut.isPending}
											onClick={() => {
												if (window.confirm(`Delete "${startup.name}"?`)) {
													deleteMut.mutate(startup.id);
												}
											}}
										>
											Delete
										</button>
									</div>
								)}
							</div>

							{startup.location && (
								<p className="text-foreground/60 text-xs">📍 {startup.location}</p>
							)}
							{startup.website && (
								<a
									href={startup.website}
									target="_blank"
									rel="noreferrer"
									className="text-accent text-xs hover:underline"
								>
									{startup.website}
								</a>
							)}
							{startup.description && (
								<p className="text-foreground/70 mt-1 line-clamp-3 text-sm">
									{startup.description}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function StartupForm({
	founders,
	initial,
	isPending,
	onSubmit,
	onCancel,
}: {
	founders: FounderOut[];
	initial: StartupOut | null;
	isPending: boolean;
	onSubmit: (values: StartupIn) => void;
	onCancel: () => void;
}) {
	const [values, setValues] = useState<StartupIn>(() =>
		initial
			? {
					name: initial.name,
					description: initial.description,
					website: initial.website,
					linkedin: initial.linkedin,
					email: initial.email,
					location: initial.location,
					notes: initial.notes,
					founding_date: initial.founding_date,
					founder_ids: initial.founders.map((f) => f.id),
				}
			: {
					name: '',
					description: '',
					website: '',
					linkedin: '',
					email: '',
					location: '',
					notes: '',
					founding_date: null,
					founder_ids: [],
				},
	);

	function set<K extends keyof StartupIn>(key: K, value: StartupIn[K]) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function toggleFounder(id: number) {
		setValues((prev) => ({
			...prev,
			founder_ids: prev.founder_ids.includes(id)
				? prev.founder_ids.filter((f) => f !== id)
				: [...prev.founder_ids, id],
		}));
	}

	return (
		<form
			className="border-accent/20 mt-2 flex flex-col gap-3 rounded-lg border p-4"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(values);
			}}
		>
			<div className="flex flex-col gap-1.5">
				<label htmlFor="startup-name" className={labelVariants({ size: 'sm' })}>
					name *
				</label>
				<input
					id="startup-name"
					type="text"
					className={inputVariants({ size: 'sm' })}
					value={values.name}
					onChange={(e) => set('name', e.target.value)}
					required
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className={labelVariants({ size: 'sm' })}>founders</label>
				{founders.length === 0 ? (
					<p className="text-foreground/60 text-xs">
						No founders yet — add some under the Founders tab first.
					</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{founders.map((f) => {
							const selected = values.founder_ids.includes(f.id);
							return (
								<button
									type="button"
									key={f.id}
									onClick={() => toggleFounder(f.id)}
									className={cn(
										'cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors',
										selected
											? 'bg-accent/20 border-accent'
											: 'border-accent/30 hover:border-accent/60',
									)}
								>
									{f.first_name} {f.last_name}
								</button>
							);
						})}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="startup-date" className={labelVariants({ size: 'sm' })}>
						founding date
					</label>
					<input
						id="startup-date"
						type="date"
						className={inputVariants({ size: 'sm' })}
						value={values.founding_date ?? ''}
						onChange={(e) => set('founding_date', e.target.value || null)}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="startup-email" className={labelVariants({ size: 'sm' })}>
						email
					</label>
					<input
						id="startup-email"
						type="email"
						className={inputVariants({ size: 'sm' })}
						value={values.email}
						onChange={(e) => set('email', e.target.value)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="startup-website" className={labelVariants({ size: 'sm' })}>
						website
					</label>
					<input
						id="startup-website"
						type="url"
						className={inputVariants({ size: 'sm' })}
						value={values.website}
						onChange={(e) => set('website', e.target.value)}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="startup-linkedin" className={labelVariants({ size: 'sm' })}>
						linkedin
					</label>
					<input
						id="startup-linkedin"
						type="url"
						className={inputVariants({ size: 'sm' })}
						value={values.linkedin}
						onChange={(e) => set('linkedin', e.target.value)}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="startup-location" className={labelVariants({ size: 'sm' })}>
					location
				</label>
				<input
					id="startup-location"
					type="text"
					className={inputVariants({ size: 'sm' })}
					value={values.location}
					onChange={(e) => set('location', e.target.value)}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="startup-description" className={labelVariants({ size: 'sm' })}>
					description
				</label>
				<textarea
					id="startup-description"
					rows={3}
					className={cn(inputVariants({ size: 'sm' }), 'resize-none')}
					value={values.description}
					onChange={(e) => set('description', e.target.value)}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="startup-notes" className={labelVariants({ size: 'sm' })}>
					notes
				</label>
				<textarea
					id="startup-notes"
					rows={2}
					className={cn(inputVariants({ size: 'sm' }), 'resize-none')}
					value={values.notes}
					onChange={(e) => set('notes', e.target.value)}
				/>
			</div>

			<div className="mt-1 flex gap-2">
				<button
					type="submit"
					className={buttonVariants({ intent: 'primary', size: 'sm' })}
					disabled={isPending || !values.name.trim()}
				>
					{isPending ? 'saving...' : initial ? 'Save changes' : 'Create startup'}
				</button>
				<button
					type="button"
					className={buttonVariants({ intent: 'ghost', size: 'sm' })}
					onClick={onCancel}
					disabled={isPending}
				>
					Cancel
				</button>
			</div>
		</form>
	);
}

function FoundersSection({ username, role }: { username: string | undefined; role: Role }) {
	const queryClient = useQueryClient();
	const {
		data: founders = [],
		isLoading,
		error,
	} = useQuery({ queryKey: ['founders'], queryFn: fetchFounders });

	const [editing, setEditing] = useState<FounderOut | 'new' | null>(null);

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['founders'] });
		queryClient.invalidateQueries({ queryKey: ['startups'] });
	};

	const createMut = useMutation({
		mutationFn: createFounder,
		onSuccess: () => {
			invalidate();
			setEditing(null);
		},
	});

	const updateMut = useMutation({
		mutationFn: ({ id, patch }: { id: number; patch: FounderIn }) => updateFounder(id, patch),
		onSuccess: () => {
			invalidate();
			setEditing(null);
		},
	});

	const deleteMut = useMutation({
		mutationFn: deleteFounder,
		onSuccess: invalidate,
	});

	if (isLoading) {
		return <p className="text-foreground/60 mt-6 text-sm">Loading founders...</p>;
	}

	if (error) {
		return (
			<p className="text-foreground/60 mt-6 text-sm" role="alert">
				Failed to load founders.
			</p>
		);
	}

	return (
		<div className="mt-6 flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<p className="text-foreground/60 text-sm">
					{founders.length} founder{founders.length === 1 ? '' : 's'}
				</p>
				<button
					type="button"
					className={buttonVariants({ intent: 'primary', size: 'sm' })}
					onClick={() => setEditing('new')}
				>
					Add founder
				</button>
			</div>

			{editing && (
				<FounderForm
					initial={editing === 'new' ? null : editing}
					isPending={createMut.isPending || updateMut.isPending}
					onSubmit={(values) => {
						if (editing === 'new') {
							createMut.mutate(values);
						} else {
							updateMut.mutate({ id: editing.id, patch: values });
						}
					}}
					onCancel={() => setEditing(null)}
				/>
			)}

			<div className="flex flex-col gap-3">
				{founders.length === 0 && (
					<p className="text-foreground/60 text-sm">No founders yet — add the first one.</p>
				)}

				{founders.map((founder) => {
					const manage = canManage(founder.created_by, username, role);
					return (
						<div
							key={founder.id}
							className="border-accent/20 flex flex-col gap-1 rounded-lg border p-4"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div className="min-w-0">
									<h3 className="text-base font-bold capitalize">
										{founder.first_name} {founder.last_name}
									</h3>
									<p className="text-foreground/60 text-sm capitalize">{founder.occupation}</p>
								</div>
								{manage && (
									<div className="flex shrink-0 gap-2">
										<button
											type="button"
											className={buttonVariants({ intent: 'ghost', size: 'sm' })}
											onClick={() => setEditing(founder)}
										>
											Edit
										</button>
										<button
											type="button"
											className={cn(
												buttonVariants({ intent: 'ghost', size: 'sm' }),
												'hover:border-red-500/60 hover:text-red-500',
											)}
											disabled={deleteMut.isPending}
											onClick={() => {
												if (window.confirm(`Delete ${founder.first_name} ${founder.last_name}?`)) {
													deleteMut.mutate(founder.id);
												}
											}}
										>
											Delete
										</button>
									</div>
								)}
							</div>

							{founder.location && (
								<p className="text-foreground/60 text-xs">📍 {founder.location}</p>
							)}
							{founder.linkedin && (
								<a
									href={founder.linkedin}
									target="_blank"
									rel="noreferrer"
									className="text-accent text-xs hover:underline"
								>
									{founder.linkedin}
								</a>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function FounderForm({
	initial,
	isPending,
	onSubmit,
	onCancel,
}: {
	initial: FounderOut | null;
	isPending: boolean;
	onSubmit: (values: FounderIn) => void;
	onCancel: () => void;
}) {
	const [values, setValues] = useState<FounderIn>(() =>
		initial
			? {
					first_name: initial.first_name,
					last_name: initial.last_name,
					location: initial.location,
					occupation: initial.occupation,
					linkedin: initial.linkedin,
					email: initial.email,
					notes: initial.notes,
				}
			: {
					first_name: '',
					last_name: '',
					location: '',
					occupation: 'graduated',
					linkedin: '',
					email: '',
					notes: '',
				},
	);

	function set<K extends keyof FounderIn>(key: K, value: FounderIn[K]) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	return (
		<form
			className="border-accent/20 mt-2 flex flex-col gap-3 rounded-lg border p-4"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(values);
			}}
		>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="founder-first" className={labelVariants({ size: 'sm' })}>
						first name *
					</label>
					<input
						id="founder-first"
						type="text"
						className={inputVariants({ size: 'sm' })}
						value={values.first_name}
						onChange={(e) => set('first_name', e.target.value)}
						required
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="founder-last" className={labelVariants({ size: 'sm' })}>
						last name *
					</label>
					<input
						id="founder-last"
						type="text"
						className={inputVariants({ size: 'sm' })}
						value={values.last_name}
						onChange={(e) => set('last_name', e.target.value)}
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="founder-occupation" className={labelVariants({ size: 'sm' })}>
						occupation
					</label>
					<select
						id="founder-occupation"
						className={inputVariants({ size: 'sm' })}
						value={values.occupation}
						onChange={(e) => set('occupation', e.target.value as FounderIn['occupation'])}
					>
						<option value="bachelors">Bachelors</option>
						<option value="masters">Masters</option>
						<option value="phd">PhD</option>
						<option value="graduated">Graduated</option>
					</select>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="founder-location" className={labelVariants({ size: 'sm' })}>
						location
					</label>
					<input
						id="founder-location"
						type="text"
						className={inputVariants({ size: 'sm' })}
						value={values.location}
						onChange={(e) => set('location', e.target.value)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="founder-email" className={labelVariants({ size: 'sm' })}>
						email
					</label>
					<input
						id="founder-email"
						type="email"
						className={inputVariants({ size: 'sm' })}
						value={values.email}
						onChange={(e) => set('email', e.target.value)}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="founder-linkedin" className={labelVariants({ size: 'sm' })}>
						linkedin
					</label>
					<input
						id="founder-linkedin"
						type="url"
						className={inputVariants({ size: 'sm' })}
						value={values.linkedin}
						onChange={(e) => set('linkedin', e.target.value)}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="founder-notes" className={labelVariants({ size: 'sm' })}>
					notes
				</label>
				<textarea
					id="founder-notes"
					rows={2}
					className={cn(inputVariants({ size: 'sm' }), 'resize-none')}
					value={values.notes}
					onChange={(e) => set('notes', e.target.value)}
				/>
			</div>

			<div className="mt-1 flex gap-2">
				<button
					type="submit"
					className={buttonVariants({ intent: 'primary', size: 'sm' })}
					disabled={isPending || !values.first_name.trim() || !values.last_name.trim()}
				>
					{isPending ? 'saving...' : initial ? 'Save changes' : 'Create founder'}
				</button>
				<button
					type="button"
					className={buttonVariants({ intent: 'ghost', size: 'sm' })}
					onClick={onCancel}
					disabled={isPending}
				>
					Cancel
				</button>
			</div>
		</form>
	);
}
