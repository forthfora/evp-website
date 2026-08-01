import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { ApiRequestError, useRequestOtp, useUpdateMe, useVerifyOtp } from '@/shared/lib/auth/api';
import { useAuth } from '@/shared/lib/auth/use-auth';

import type { Step } from './types';

const CODE_LENGTH = 6;

function getErrorMessage(err: unknown, fallback: string) {
	return err instanceof ApiRequestError ? err.message : fallback;
}

export function useAuthFlow() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [step, setStep] = useState<Step>('email');
	const [direction, setDirection] = useState(1);
	const [email, setEmail] = useState('');
	const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [error, setError] = useState<string | null>(null);

	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const requestCodeMut = useRequestOtp();
	const verifyCodeMut = useVerifyOtp();
	const updateMeMut = useUpdateMe();

	const goTo = (next: Step, dir: number) => {
		setDirection(dir);
		setStep(next);
	};

	const sendCode = async () => {
		if (!email.trim()) return;
		setError(null);

		try {
			await requestCodeMut.mutateAsync({ email: email.trim() });
			return true;
		} catch (err) {
			setError(getErrorMessage(err, 'Something went wrong. Please try again.'));
			return false;
		}
	};

	const handleSendCode = async () => {
		if (!(await sendCode())) return;

		// Existing users log straight in after the code; new accounts are
		// created on verify (`created: true`) and then prompted for a name.
		goTo('code', 1);
		// Focus the first digit input after the step transition animation.
		setTimeout(() => inputRefs.current[0]?.focus(), 150);
	};

	const handleResendCode = async () => {
		if (!(await sendCode())) return;
		setCodeDigits(Array(CODE_LENGTH).fill(''));
	};

	const handleDigitChange = (index: number, value: string) => {
		if (!/^\d?$/.test(value)) return; // only digits

		const newDigits = [...codeDigits];
		newDigits[index] = value;
		setCodeDigits(newDigits);

		// Auto-advance to the next input
		if (value && index < CODE_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleDigitKeyDown = (index: number, key: string) => {
		if (key === 'Backspace' && !codeDigits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleDigitPaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
		const newDigits = [...codeDigits];
		for (let i = 0; i < pasted.length; i++) {
			newDigits[i] = pasted[i];
		}
		setCodeDigits(newDigits);
		inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
	};

	const handleVerify = async () => {
		const code = codeDigits.join('');
		if (code.length !== CODE_LENGTH) return;

		setError(null);

		try {
			const { created } = await verifyCodeMut.mutateAsync({ email: email.trim(), code });

			await login();

			if (created) {
				// Brand-new account: collect first/last name before entering.
				goTo('names', 1);
			} else {
				navigate('/member', { viewTransition: true });
			}
		} catch (err) {
			setError(getErrorMessage(err, 'Invalid or expired verification code.'));
		}
	};

	const handleBackToEmail = () => {
		goTo('email', -1);
		setCodeDigits(Array(CODE_LENGTH).fill(''));
		setError(null);
	};

	const handleSubmitNames = async () => {
		setError(null);

		try {
			await updateMeMut.mutateAsync({ first_name: firstName.trim(), last_name: lastName.trim() });
			navigate('/member', { viewTransition: true });
		} catch (err) {
			setError(getErrorMessage(err, 'Something went wrong. Please try again.'));
		}
	};

	return {
		step,
		direction,
		error,
		inputRefs,

		email: { value: email, set: setEmail },
		names: { first: firstName, setFirst: setFirstName, last: lastName, setLast: setLastName },
		codeDigits,

		isSendingCode: requestCodeMut.isPending,
		isVerifying: verifyCodeMut.isPending,
		isSavingNames: updateMeMut.isPending,

		handleSendCode,
		handleResendCode,
		handleDigitChange,
		handleDigitKeyDown,
		handleDigitPaste,
		handleVerify,
		handleBackToEmail,
		handleSubmitNames,
	};
}
