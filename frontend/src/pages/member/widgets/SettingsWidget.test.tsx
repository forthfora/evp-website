import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SettingsWidget } from './SettingsWidget';

const { mockLogin, mockUpdateMe, mockRequestOtp, mockChangeEmail } = vi.hoisted(() => ({
	mockLogin: vi.fn(),
	mockUpdateMe: vi.fn(),
	mockRequestOtp: vi.fn(),
	mockChangeEmail: vi.fn(),
}));

vi.mock('@/shared/lib/auth/use-auth', () => ({
	useAuth: () => ({
		user: {
			username: 'u-1',
			email: 'old@test.com',
			role: 'member',
			date_joined: '2026-01-01T00:00:00',
			first_name: 'Ada',
			last_name: 'Lovelace',
			receives_update_emails: true,
		},
		isAuthenticated: true,
		login: mockLogin,
		logout: vi.fn(),
	}),
}));

vi.mock('@/shared/lib/auth/api', () => ({
	useUpdateMe: () => ({ mutateAsync: mockUpdateMe, isPending: false }),
	useRequestOtp: () => ({ mutateAsync: mockRequestOtp, isPending: false }),
	useChangeEmail: () => ({ mutateAsync: mockChangeEmail, isPending: false }),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('SettingsWidget', () => {
	it('saves the first and last name', async () => {
		mockUpdateMe.mockResolvedValue({});

		render(<SettingsWidget />, { wrapper: createWrapper() });

		const firstName = screen.getByPlaceholderText('First name');
		await userEvent.clear(firstName);
		await userEvent.type(firstName, 'Grace');
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		await waitFor(() => {
			expect(mockUpdateMe).toHaveBeenCalledWith({
				first_name: 'Grace',
				last_name: 'Lovelace',
			});
		});
		expect(mockLogin).toHaveBeenCalled();
	});

	it('changes email via OTP', async () => {
		mockRequestOtp.mockResolvedValue({ exists: false });
		mockChangeEmail.mockResolvedValue({});

		render(<SettingsWidget />, { wrapper: createWrapper() });

		await userEvent.type(screen.getByPlaceholderText('New email address'), 'new@test.com');
		await userEvent.click(screen.getByRole('button', { name: /send code/i }));

		await waitFor(() => {
			expect(mockRequestOtp).toHaveBeenCalledWith({ email: 'new@test.com' });
		});

		await userEvent.type(screen.getByPlaceholderText('6-digit code'), '123456');
		await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

		await waitFor(() => {
			expect(mockChangeEmail).toHaveBeenCalledWith({
				email: 'new@test.com',
				code: '123456',
			});
		});
		expect(mockLogin).toHaveBeenCalled();
	});

	it('toggles the update-email opt-in', async () => {
		mockUpdateMe.mockResolvedValue({});

		render(<SettingsWidget />, { wrapper: createWrapper() });

		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeChecked();
		await userEvent.click(checkbox);

		await waitFor(() => {
			expect(mockUpdateMe).toHaveBeenCalledWith({ receives_update_emails: false });
		});
	});
});
