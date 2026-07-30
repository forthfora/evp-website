import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

const { mockUseAuth } = vi.hoisted(() => ({
	mockUseAuth: vi.fn(),
}));

vi.mock('@/shared/lib/auth/use-auth', () => ({
	useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
	it('redirects to /join when unauthenticated', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
		});

		const { ProtectedRoute } = await import('./ProtectedRoute');

		render(
			<MemoryRouter initialEntries={['/member']}>
				<Routes>
					<Route
						path="/member"
						element={
							<ProtectedRoute>
								<p data-testid="protected-content">Secret</p>
							</ProtectedRoute>
						}
					/>
					<Route path="/join" element={<p data-testid="join-page">Join</p>} />
				</Routes>
			</MemoryRouter>,
		);

		// Should redirect to /join
		expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
		expect(screen.getByTestId('join-page')).toBeInTheDocument();
	});

	it('renders children when authenticated', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			user: { email: 'a@b.com', role: 'member' },
		});

		const { ProtectedRoute } = await import('./ProtectedRoute');

		render(
			<MemoryRouter initialEntries={['/member']}>
				<Routes>
					<Route
						path="/member"
						element={
							<ProtectedRoute>
								<p data-testid="protected-content">Secret</p>
							</ProtectedRoute>
						}
					/>
					<Route path="/join" element={<p data-testid="join-page">Join</p>} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByTestId('protected-content')).toBeInTheDocument();
		expect(screen.queryByTestId('join-page')).not.toBeInTheDocument();
	});

	it('shows nothing while loading', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: false,
			isLoading: true,
		});

		const { ProtectedRoute } = await import('./ProtectedRoute');

		render(
			<MemoryRouter initialEntries={['/member']}>
				<Routes>
					<Route
						path="/member"
						element={
							<ProtectedRoute>
								<p data-testid="protected-content">Secret</p>
							</ProtectedRoute>
						}
					/>
					<Route path="/join" element={<p data-testid="join-page">Join</p>} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
		expect(screen.queryByTestId('join-page')).not.toBeInTheDocument();
	});
});

describe('RoleRoute', () => {
	it('shows forbidden page when role is not in allowed list', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			user: { email: 'scout@test.com', role: 'scout' },
		});

		const { RoleRoute } = await import('./RoleRoute');

		render(
			<MemoryRouter initialEntries={['/admin-only']}>
				<Routes>
					<Route
						path="/admin-only"
						element={
							<RoleRoute roles={['admin']}>
								<p data-testid="admin-content">Admin Panel</p>
							</RoleRoute>
						}
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
		expect(screen.getByText('403')).toBeInTheDocument();
	});

	it('renders children when role is in allowed list', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			user: { email: 'admin@test.com', role: 'admin' },
		});

		const { RoleRoute } = await import('./RoleRoute');

		render(
			<MemoryRouter initialEntries={['/admin-only']}>
				<Routes>
					<Route
						path="/admin-only"
						element={
							<RoleRoute roles={['admin']}>
								<p data-testid="admin-content">Admin Panel</p>
							</RoleRoute>
						}
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByTestId('admin-content')).toBeInTheDocument();
	});

	it('renders children when role matches one of many allowed roles', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: true,
			user: { email: 'scout@test.com', role: 'scout' },
		});

		const { RoleRoute } = await import('./RoleRoute');

		render(
			<MemoryRouter initialEntries={['/startup-db']}>
				<Routes>
					<Route
						path="/startup-db"
						element={
							<RoleRoute roles={['scout', 'committee', 'admin']}>
								<p data-testid="startup-content">Startup DB</p>
							</RoleRoute>
						}
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByTestId('startup-content')).toBeInTheDocument();
	});

	it('redirects to /join when unauthenticated', async () => {
		mockUseAuth.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
		});

		const { RoleRoute } = await import('./RoleRoute');

		render(
			<MemoryRouter initialEntries={['/scout-only']}>
				<Routes>
					<Route
						path="/scout-only"
						element={
							<RoleRoute roles={['scout']}>
								<p data-testid="scout-content">Scout Area</p>
							</RoleRoute>
						}
					/>
					<Route path="/join" element={<p data-testid="join-page">Join</p>} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.queryByTestId('scout-content')).not.toBeInTheDocument();
		expect(screen.getByTestId('join-page')).toBeInTheDocument();
	});
});
