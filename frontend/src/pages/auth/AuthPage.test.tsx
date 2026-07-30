import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AuthPage } from './AuthPage';

const { mockLogin, mockNavigate, mockRequestCode, mockVerifyCode, mockFetchMe } = vi.hoisted(
	() => ({
		mockLogin: vi.fn(),
		mockNavigate: vi.fn(),
		mockRequestCode: vi.fn(),
		mockVerifyCode: vi.fn(),
		mockFetchMe: vi.fn(),
	}),
);

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock('@/shared/lib/auth/use-auth', () => ({
	useAuth: () => ({
		login: mockLogin,
		isAuthenticated: false,
	}),
}));

vi.mock('@/shared/lib/auth/api', () => ({
	useRequestCode: () => ({
		mutateAsync: mockRequestCode,
		isPending: false,
	}),
	useVerifyCode: () => ({
		mutateAsync: mockVerifyCode,
		isPending: false,
	}),
	fetchMe: mockFetchMe,
	ApiRequestError: class extends Error {
		status: number;
		constructor(status: number, message: string) {
			super(message);
			this.status = status;
			this.name = 'ApiRequestError';
		}
	},
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<MemoryRouter>{children}</MemoryRouter>
			</QueryClientProvider>
		);
	};
}

describe('AuthPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the email step by default', () => {
		render(<AuthPage />, { wrapper: createWrapper() });

		expect(screen.getByPlaceholderText(/your email|you@/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send code|continue/i })).toBeInTheDocument();
	});

	it('shows an error for an empty email submission', async () => {
		render(<AuthPage />, { wrapper: createWrapper() });

		await userEvent.click(screen.getByRole('button', { name: /send code|continue/i }));

		expect(mockRequestCode).not.toHaveBeenCalled();
	});

	it('calls requestCode with the entered email and advances to code step', async () => {
		mockRequestCode.mockResolvedValue(undefined);

		render(<AuthPage />, { wrapper: createWrapper() });

		await userEvent.type(screen.getByPlaceholderText(/your email|you@/i), 'test@example.com');
		await userEvent.click(screen.getByRole('button', { name: /send code|continue/i }));

		expect(mockRequestCode).toHaveBeenCalledWith({
			email: 'test@example.com',
		});

		// Should now show the code step
		await waitFor(() => {
			expect(screen.getByText(/check your email/i)).toBeInTheDocument();
		});
	});

	it('shows an error when verifyCode fails', async () => {
		mockRequestCode.mockResolvedValue(undefined);
		mockVerifyCode.mockRejectedValue(new Error('Invalid or expired code.'));

		render(<AuthPage />, { wrapper: createWrapper() });

		// Email step
		await userEvent.type(screen.getByPlaceholderText(/your email|you@/i), 'test@example.com');
		await userEvent.click(screen.getByRole('button', { name: /send code|continue/i }));

		// Wait for code step
		await waitFor(() => {
			expect(screen.getByText(/check your email/i)).toBeInTheDocument();
		});

		// Fill all 6 code digit inputs
		const codeInputs = screen.getAllByRole('textbox');
		for (let i = 0; i < 6; i++) {
			await userEvent.type(codeInputs[i], `${i + 1}`);
		}

		await userEvent.click(screen.getByRole('button', { name: /verify|sign in/i }));

		await waitFor(() => {
			expect(screen.getByText(/invalid|expired/i)).toBeInTheDocument();
		});
	});

	it('calls login and navigates on successful verify', async () => {
		mockRequestCode.mockResolvedValue(undefined);
		mockVerifyCode.mockResolvedValue({ access: 'test-access-token' });
		mockFetchMe.mockResolvedValue({
			email: 'test@example.com',
			role: 'member',
			date_joined: '2026-01-01T00:00:00',
		});

		render(<AuthPage />, { wrapper: createWrapper() });

		// Email step
		await userEvent.type(screen.getByPlaceholderText(/your email|you@/i), 'test@example.com');
		await userEvent.click(screen.getByRole('button', { name: /send code|continue/i }));

		// Wait for code step
		await waitFor(() => {
			expect(screen.getByText(/check your email/i)).toBeInTheDocument();
		});

		// Fill all 6 code digit inputs
		const codeInputs = screen.getAllByRole('textbox');
		for (let i = 0; i < 6; i++) {
			await userEvent.type(codeInputs[i], `${i + 1}`);
		}

		await userEvent.click(screen.getByRole('button', { name: /verify|sign in/i }));

		await waitFor(() => {
			expect(mockVerifyCode).toHaveBeenCalled();
		});

		// login should have been called with the token
		expect(mockLogin).toHaveBeenCalledWith('test-access-token', {
			email: 'test@example.com',
			role: 'member',
			date_joined: expect.any(String),
		});

		// Should navigate to the member area
		expect(mockNavigate).toHaveBeenCalledWith('/member');
	});
});
