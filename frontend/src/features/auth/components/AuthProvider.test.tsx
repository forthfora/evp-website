import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from '@/features/auth/components/AuthProvider';

const { mockFetchMe, mockLogout } = vi.hoisted(() => ({
	mockFetchMe: vi.fn(),
	mockLogout: vi.fn(),
}));

vi.mock('@/lib/auth/api', () => ({
	fetchMe: mockFetchMe,
	logout: mockLogout,
}));

const memberProfile = {
	username: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
	email: 'member@test.com',
	role: 'member' as const,
	date_joined: '2026-01-01T00:00:00',
	first_name: 'Ada',
	last_name: 'Lovelace',
	receives_update_emails: true,
};

function Probe() {
	const { user, isAuthenticated, isLoading, login, logout } = useAuth();

	return (
		<div>
			<span data-testid="email">{user?.email ?? 'none'}</span>
			<span data-testid="auth">{String(isAuthenticated)}</span>
			<span data-testid="loading">{String(isLoading)}</span>
			<button type="button" onClick={() => void login()}>
				login
			</button>
			<button type="button" onClick={() => void logout()}>
				logout
			</button>
		</div>
	);
}

function renderAuth() {
	return render(
		<AuthProvider>
			<Probe />
		</AuthProvider>,
	);
}

describe('AuthProvider', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string) => {
				if (url === '/api/accounts/me') {
					return new Response(
						JSON.stringify({
							email: 'member@test.com',
							username: 'testmember',
							role: 'member',
							date_joined: '2026-01-01T00:00:00Z',
							first_name: 'Test',
							last_name: 'User',
							receives_update_emails: true,
						}),
						{
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						},
					);
				}

				if (url === '/api/accounts/logout' || url.includes('logout')) {
					return new Response(null, { status: 204 });
				}

				// Mock CSRF token fetch if your API client requests it during tests
				if (url === '/api/csrf') {
					return new Response(JSON.stringify({ csrftoken: 'fake-token' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				return new Response(null, { status: 404 });
			}),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('hydrates the user from fetchMe on mount when a session exists', async () => {
		mockFetchMe.mockResolvedValue(memberProfile);

		renderAuth();

		// Loading while the session hydrate runs
		expect(screen.getByTestId('loading')).toHaveTextContent('true');

		await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('member@test.com'));
		expect(screen.getByTestId('auth')).toHaveTextContent('true');
		expect(screen.getByTestId('loading')).toHaveTextContent('false');
	});

	test('stays unauthenticated when there is no active session', async () => {
		vi.mocked(fetch).mockImplementationOnce(async (url) => {
			if (url === '/api/accounts/me') {
				return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			return new Response(null, { status: 404 });
		});

		renderAuth();

		await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
		expect(screen.getByTestId('auth')).toHaveTextContent('false');
		expect(screen.getByTestId('email')).toHaveTextContent('none');
	});

	it('login() re-fetches the profile and authenticates', async () => {
		mockFetchMe.mockRejectedValue(new Error('401'));

		renderAuth();
		await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

		mockFetchMe.mockResolvedValue(memberProfile);

		await userEvent.click(screen.getByRole('button', { name: 'login' }));

		await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));
		expect(screen.getByTestId('email')).toHaveTextContent('member@test.com');
	});

	it('logout() calls the backend then clears the user', async () => {
		mockFetchMe.mockResolvedValue(memberProfile);
		mockLogout.mockResolvedValue(undefined);

		renderAuth();
		await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('member@test.com'));

		await userEvent.click(screen.getByRole('button', { name: 'logout' }));

		await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('none'));

		expect(vi.mocked(fetch)).toHaveBeenCalledWith(
			expect.stringMatching('/api/accounts/logout'),
			expect.objectContaining({ method: 'POST' }),
		);
		expect(screen.getByTestId('auth')).toHaveTextContent('false');
	});
});
