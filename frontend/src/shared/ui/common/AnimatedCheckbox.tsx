import { motion } from 'framer-motion';

type AnimatedCheckboxProps = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
};

export function AnimatedCheckbox({ checked, onChange, disabled }: AnimatedCheckboxProps) {
	return (
		<label
			className={`inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
		>
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(e) => onChange(e.target.checked)}
				className="peer sr-only"
			/>

			<motion.div
				animate={{
					borderColor: checked ? 'var(--color-accent)' : 'var(--foreground-muted)',
					backgroundColor: checked ? 'var(--color-accent)' : 'transparent',
				}}
				transition={{ duration: 0.2 }}
				className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2"
			>
				<svg viewBox="0 0 16 16" className="h-3 w-3">
					<motion.path
						d="M3 8.5L6.5 12L13 4"
						fill="none"
						stroke="white"
						strokeWidth={2.5}
						strokeLinecap="round"
						strokeLinejoin="round"
						initial={false}
						animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
						transition={{ duration: 0.25, ease: 'easeOut' }}
					/>
				</svg>
			</motion.div>
		</label>
	);
}
