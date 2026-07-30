import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

const { mockUseAuth } = vi.hoisted(() => ({
	mockUseAuth: vi.fn(),
}));

vi.mock('@/shared/lib/auth/use-auth', () => ({
	useAuth: () => mockUseAuth(),
}));

/** Convenience: find a heading by its text. */
function heading(name: string | RegExp) {
	return screen.getByRole('heading', { name });
}

describe('MemberDashboardPage', () => {
	it('renders only member-eligible widgets for member role', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			user: { email: 'member@test.com', role: 'member' },
		});

		const { MemberDashboardPage } = await import('./MemberDashboardPage');

		render(
			<MemoryRouter>
				<MemberDashboardPage />
			</MemoryRouter>,
		);

		expect(heading(/welcome/i)).toBeInTheDocument();

		// Widgets requiring scout+ or admin should NOT be visible
		expect(screen.queryByRole('heading', { name: /startup database/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /members/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /send update/i })).not.toBeInTheDocument();
	});

	it('renders scout widgets for scout role', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			user: { email: 'scout@test.com', role: 'scout' },
		});

		const { MemberDashboardPage } = await import('./MemberDashboardPage');

		render(
			<MemoryRouter>
				<MemberDashboardPage />
			</MemoryRouter>,
		);

		expect(heading(/welcome/i)).toBeInTheDocument();
		expect(heading(/startup database/i)).toBeInTheDocument();

		// Committee/admin-only widgets should NOT be visible
		expect(screen.queryByRole('heading', { name: /members/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /send update/i })).not.toBeInTheDocument();
	});

	it('renders committee widgets for committee role', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			user: { email: 'committee@test.com', role: 'committee' },
		});

		const { MemberDashboardPage } = await import('./MemberDashboardPage');

		render(
			<MemoryRouter>
				<MemberDashboardPage />
			</MemoryRouter>,
		);

		expect(heading(/welcome/i)).toBeInTheDocument();
		expect(heading(/startup database/i)).toBeInTheDocument();
		expect(heading(/members/i)).toBeInTheDocument();

		// Admin-only widget should NOT be visible
		expect(screen.queryByRole('heading', { name: /send update/i })).not.toBeInTheDocument();
	});

	it('renders admin widgets for admin role', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			user: { email: 'admin@test.com', role: 'admin' },
		});

		const { MemberDashboardPage } = await import('./MemberDashboardPage');

		render(
			<MemoryRouter>
				<MemberDashboardPage />
			</MemoryRouter>,
		);

		expect(heading(/welcome/i)).toBeInTheDocument();
		expect(heading(/startup database/i)).toBeInTheDocument();
		expect(heading(/members/i)).toBeInTheDocument();
		expect(heading(/send update/i)).toBeInTheDocument();
	});
});
