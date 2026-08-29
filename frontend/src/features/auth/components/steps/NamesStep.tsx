import { ErrorBanner } from '../ErrorBanner';
import { inputClass, primaryBtnClass } from '../../styles';

type NamesStepProps = {
	firstName: string;
	onFirstNameChange: (value: string) => void;
	lastName: string;
	onLastNameChange: (value: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
	error: string | null;
};

export function NamesStep({
	firstName,
	onFirstNameChange,
	lastName,
	onLastNameChange,
	onSubmit,
	isSubmitting,
	error,
}: NamesStepProps) {
	return (
		<div className="mx-auto w-full max-w-md">
			<div className="glass-box rounded-2xl p-8 shadow-xl md:p-12">
				<h1 className="mb-2 text-center text-4xl font-bold">One last step...</h1>
				<p className="text-foreground mb-4 text-center text-2xl">
					Your account is almost ready, we'd just like some details.
				</p>

				<p className="text-foreground-muted mb-8 text-center text-sm">
					Don't worry - you can always change these later.
				</p>

				{error && <ErrorBanner message={error} />}

				<div className="flex flex-col gap-4">
					<input
						type="text"
						value={firstName}
						onChange={(e) => onFirstNameChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') onSubmit();
						}}
						placeholder="First name"
						autoComplete="given-name"
						disabled={isSubmitting}
						className={inputClass}
					/>
					<input
						type="text"
						value={lastName}
						onChange={(e) => onLastNameChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') onSubmit();
						}}
						placeholder="Last name"
						autoComplete="family-name"
						disabled={isSubmitting}
						className={inputClass}
					/>

					<button
						type="button"
						onClick={onSubmit}
						disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
						className={primaryBtnClass}
					>
						{isSubmitting ? 'saving...' : 'continue'}
					</button>
				</div>
			</div>
		</div>
	);
}
