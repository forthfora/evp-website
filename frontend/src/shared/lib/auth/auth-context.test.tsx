import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from './auth-context';

const { mockFetchMe, mockLogout } = vi.hoisted(() => ({
	mockFetchMe: vi.fn(),
	mockLogout: vi.fn(),
}));

vi.mock('./api', () => ({
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
		vi.clearAllMocks();
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

	it('stays unauthenticated when there is no active session', async () => {
		mockFetchMe.mockRejectedValue(new Error('401'));

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
		expect(mockLogout).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId('auth')).toHaveTextContent('false');
	});
});
