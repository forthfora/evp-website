import { DashboardNavButton } from './DashboardNavButton';
import type { DashboardPage } from './DashboardPages.data';

interface DashboardNavProps {
	pages: DashboardPage[];
	activePageId: string;
}

export function DashboardNav({ pages, activePageId }: DashboardNavProps) {
	if (pages.length <= 1) return null;

	return (
		<nav aria-label="Dashboard sections" className="flex justify-center">
			<ul className="flex flex-wrap items-center justify-center gap-15">
				{pages.map((page, i) => (
					<li key={page.id} className="flex items-center gap-4 md:gap-15">
						<DashboardNavButton
							to={`/member#${page.id}`}
							label={page.label}
							isActive={page.id === activePageId}
						/>
						{i < pages.length - 1 && (
							<span className="text-foreground-muted select-none" aria-hidden>
								|
							</span>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
}
