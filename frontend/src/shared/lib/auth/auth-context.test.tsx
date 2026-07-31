import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider } from './auth-context.tsx';
import { useAuth } from './use-auth';

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<AuthProvider>{children}</AuthProvider>
			</QueryClientProvider>
		);
	};
}

/** A test component that reads AuthContext and renders its state. */
function TestConsumer() {
	const auth = useAuth();
	return (
		<div>
			<p data-testid="authenticated">{auth.isAuthenticated ? 'true' : 'false'}</p>
			<p data-testid="email">{auth.user?.email ?? 'null'}</p>
			<p data-testid="role">{auth.user?.role ?? 'null'}</p>
			<p data-testid="loading">{auth.isLoading ? 'true' : 'false'}</p>
			<button
				data-testid="login-btn"
				onClick={() =>
					auth.login('test-access-token', {
						email: 'a@b.com',
						role: 'member',
						date_joined: '2026-01-01',
					})
				}
			>
				Login
			</button>
			<button data-testid="logout-btn" onClick={() => auth.logout()}>
				Logout
			</button>
		</div>
	);
}

describe('AuthContext', () => {
	beforeEach(() => {
		// Reset fetch mock between tests
		vi.restoreAllMocks();
	});

	it('starts unauthenticated', async () => {
		render(<TestConsumer />, { wrapper: createWrapper() });

		await waitFor(() => {
			expect(screen.getByTestId('loading').textContent).toBe('false');
		});

		expect(screen.getByTestId('authenticated').textContent).toBe('false');
		expect(screen.getByTestId('email').textContent).toBe('null');
		expect(screen.getByTestId('role').textContent).toBe('null');
	});

	it('becomes authenticated after login', async () => {
		render(<TestConsumer />, { wrapper: createWrapper() });

		await userEvent.click(screen.getByTestId('login-btn'));

		expect(screen.getByTestId('authenticated').textContent).toBe('true');
		expect(screen.getByTestId('email').textContent).toBe('a@b.com');
		expect(screen.getByTestId('role').textContent).toBe('member');
	});

	it('clears state after logout', async () => {
		render(<TestConsumer />, { wrapper: createWrapper() });

		await userEvent.click(screen.getByTestId('login-btn'));
		expect(screen.getByTestId('authenticated').textContent).toBe('true');

		await userEvent.click(screen.getByTestId('logout-btn'));

		expect(screen.getByTestId('authenticated').textContent).toBe('false');
		expect(screen.getByTestId('email').textContent).toBe('null');
		expect(screen.getByTestId('role').textContent).toBe('null');
	});

	it('attempts silent refresh on mount when cookie is present', async () => {
		// Mock a successful refresh response
		const fetchMock = vi.spyOn(globalThis, 'fetch');
		fetchMock.mockImplementation(async (url) => {
			if (url.toString().includes('/api/auth/refresh/')) {
				return new Response(JSON.stringify({ access: 'refreshed-token' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			if (url.toString().includes('/api/accounts/me')) {
				return new Response(
					JSON.stringify({
						email: 'silent@refresh.com',
						role: 'scout',
						date_joined: '2026-01-01',
					}),
					{ status: 200, headers: { 'Content-Type': 'application/json' } },
				);
			}
			return new Response('Not Found', { status: 404 });
		});

		render(<TestConsumer />, { wrapper: createWrapper() });

		// Should eventually become authenticated via silent refresh
		await waitFor(() => {
			expect(screen.getByTestId('authenticated').textContent).toBe('true');
		});
		expect(screen.getByTestId('email').textContent).toBe('silent@refresh.com');
		expect(screen.getByTestId('role').textContent).toBe('scout');
	});

	it('stays unauthenticated when silent refresh fails', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch');
		fetchMock.mockImplementation(async (url) => {
			if (url.toString().includes('/api/auth/refresh/')) {
				return new Response(JSON.stringify({ detail: 'no cookie' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			return new Response('Not Found', { status: 404 });
		});

		render(<TestConsumer />, { wrapper: createWrapper() });

		// Wait for loading to finish
		await waitFor(() => {
			expect(screen.getByTestId('loading').textContent).toBe('false');
		});

		expect(screen.getByTestId('authenticated').textContent).toBe('false');
		expect(screen.getByTestId('email').textContent).toBe('null');
	});
});
